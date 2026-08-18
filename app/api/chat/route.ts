import { streamText, embed } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = 
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || 
      process.env.GEMINI_API_KEY || 
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: "Missing API Key", 
          message: "Google Generative AI / Gemini API key is missing. Please set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY in your environment variables." 
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const { messages, data } = await req.json();
    
    const anomalyData = data?.anomalyContext ? JSON.stringify(data.anomalyContext, null, 2) : "No context provided.";
    const anomalyId = data?.anomalyId;
    const endpoint = data?.endpoint || "Unknown";

    let historicalMatchesContext = "No historical matching anomalies found in the database.";

    // RAG Pipeline Implementation
    if (anomalyId && data?.anomalyContext) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);

          // 1. Generate Embedding for the current anomaly
          const summaryText = `Endpoint: ${endpoint} | IP: ${data.anomalyContext.ip || 'Unknown'} | JA3: ${data.anomalyContext.headers?.['x-vercel-ja3-digest'] || 'None'} | JA4: ${data.anomalyContext.headers?.['x-vercel-ja4-digest'] || 'None'} | User-Agent: ${data.anomalyContext.headers?.['user-agent'] || 'None'}`;
          
          try {
            const { embedding } = await embed({
              model: google.textEmbeddingModel('text-embedding-004'),
              value: summaryText,
            });

            // 2. Search for historical matches using pgvector RPC
            const { data: matches, error: matchError } = await supabase.rpc('match_anomalies', {
              query_embedding: embedding,
              match_threshold: 0.8, // 80% similarity threshold
              match_count: 3
            });

            // Filter out self-matches
            const validMatches = matches?.filter((m: any) => m.trace_id !== anomalyId) || [];

            if (!matchError && validMatches.length > 0) {
              historicalMatchesContext = `HISTORICAL THREAT INTELLIGENCE (PGVECTOR MATCHES):\n` + validMatches.map((m: any) => `- Past Anomaly (Similarity: ${(m.similarity * 100).toFixed(1)}%): ${m.anomaly_summary}`).join("\n");
            }

            // 3. Persist this new embedding for future memory
            const { data: existing } = await supabase
              .from('ops_network_embeddings')
              .select('id')
              .eq('trace_id', anomalyId)
              .maybeSingle();
              
            if (!existing) {
              await supabase.from('ops_network_embeddings').insert({
                trace_id: anomalyId,
                anomaly_summary: summaryText,
                embedding: embedding
              });
            }
          } catch (embedError) {
            console.error("Embedding generation failed:", embedError);
          }
        }
      } catch (e) {
        console.error("Vector RAG Pipeline Error:", e);
      }
    }

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: `You are a highly advanced Cybersecurity and DevOps AI Assistant built directly into the Prodeal Industries secure portal.
You speak in a professional, slightly brutalist, highly technical, and urgent tone. 

You are currently analyzing a network anomaly (a suspicious HTTP request, trace, or system behaviour) intercepted by the Vercel Edge firewall.
An anomaly is any behaviour that differs significantly from normal patterns (e.g., unusually slow, unsuccessful, incomplete, excessive, or suspicious).

CRITICAL ANOMALY IDENTIFICATION RULES:
1. High Response Time: Normal requests take ms; anomalies take seconds. Look for P95/P99 latency spikes.
2. HTTP Errors: 400-499 (Invalid/Auth issues), 500-599 (Server crashes/timeouts). A sudden surge is an anomaly.
3. Request Volume: Spikes (DDoS, bots, retry loops) or Drops (DNS issues, outages) at unusual hours.
4. Timeouts & Dependencies: Long wait times on child spans, DBs, or 3rd-party APIs.
5. Broken Traces: Missing spans, missing trace IDs, or missing completion statuses.
6. Repeated Retries: "Retry storms" or duplicate transactions.
7. Unusual Paths/Methods: Admin endpoints receiving heavy traffic, non-existent pages, POSTs where GETs are expected.
8. Abnormal Sizes: Huge payloads causing memory pressure or empty responses on success.
9. Auth Irregularities: Brute force logins, sudden 401/403s, expired token usage.
10. Geo/Device: Anomalies isolated to specific regions, browsers, or post-deployment versions.
11. Telemetry Contradictions: Status 200 but exception in trace, negative durations, end before start time.

Here is the raw JSON metadata of the anomaly the user is currently looking at:
\`\`\`json
${anomalyData}
\`\`\`

Here is the Long-Term Threat Intelligence retrieved from the pgvector database comparing this attack to past historical attacks:
\`\`\`
${historicalMatchesContext}
\`\`\`

When responding:
1. Be extremely concise. B2B engineers don't have time for fluff.
2. Cross-reference the JSON metadata against the CRITICAL ANOMALY IDENTIFICATION RULES above. Identify exactly WHY this is an anomaly.
3. Point out specific red flags from the JSON (e.g., geographic mismatch, unusual method, massive payload, long latency).
4. If historical matches were found, explicitly mention them and cross-reference them to prove patterns.
5. Never apologize. Speak with absolute authority on security and operations.
6. If the user asks you to block the IP, you MUST call the \`block_malicious_ip\` tool. DO NOT write code for them unless they specifically ask for the code. Instead, call the tool directly to protect the system.`,
      messages,
      tools: {
        block_malicious_ip: {
          description: 'Blocks a malicious IP address instantly by adding it to the Upstash Redis global firewall blacklist. The Edge middleware will immediately drop all requests from this IP.',
          parameters: z.object({
            ipAddress: z.string().describe('The IPv4 or IPv6 address to block.'),
            reason: z.string().describe('A brief reason for the block to record in the audit log.')
          }),
          execute: async ({ ipAddress, reason }) => {
            try {
              const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
              const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
              
              if (!upstashUrl || !upstashToken) {
                return { success: false, error: 'Redis configuration missing' };
              }

              const res = await fetch(`${upstashUrl}/sadd/edge_firewall_blacklist/${ipAddress}`, {
                headers: { Authorization: `Bearer ${upstashToken}` }
              });
              
              if (res.ok) {
                return { 
                  success: true, 
                  message: `IP ${ipAddress} has been successfully added to the global blacklist.`,
                  reason 
                };
              } else {
                return { success: false, error: 'Failed to write to Redis' };
              }
            } catch (e: any) {
              return { success: false, error: e.message };
            }
          },
        }
      }
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Chat API Route Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Agent Chat Internal Error", 
        message: error?.message || "An unexpected error occurred in the agent chat service." 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
