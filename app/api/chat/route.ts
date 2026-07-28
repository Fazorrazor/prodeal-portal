import { streamText, embed } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, data } = await req.json();
  
  const anomalyData = data?.anomalyContext ? JSON.stringify(data.anomalyContext, null, 2) : "No context provided.";
  const anomalyId = data?.anomalyId;
  const endpoint = data?.endpoint || "Unknown";

  let historicalMatchesContext = "No historical matching anomalies found in the database.";

  // RAG Pipeline Implementation
  if (anomalyId && data.anomalyContext) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // 1. Generate Embedding for the current anomaly
      const summaryText = `Endpoint: ${endpoint} | IP: ${data.anomalyContext.ip || 'Unknown'} | JA3: ${data.anomalyContext.headers?.['x-vercel-ja3-digest'] || 'None'} | JA4: ${data.anomalyContext.headers?.['x-vercel-ja4-digest'] || 'None'} | User-Agent: ${data.anomalyContext.headers?.['user-agent'] || 'None'}`;
      
      const { embedding } = await embed({

        model: google.textEmbeddingModel('gemini-embedding-2'),
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
      // We check if it already exists to avoid duplicates if the user re-opens the modal
      const { data: existing } = await supabase
        .from('ops_network_embeddings')
        .select('id')
        .eq('trace_id', anomalyId)
        .single();
        
      if (!existing) {
        await supabase.from('ops_network_embeddings').insert({
          trace_id: anomalyId,
          anomaly_summary: summaryText,
          embedding: embedding
        });
      }
    } catch (e) {
      console.error("Vector RAG Pipeline Error:", e);
      // Fail gracefully, we still want the chat to work even if DB search fails
    }
  }

  const result = await streamText({

    model: google('gemini-flash-latest'),
    system: `You are a highly advanced Cybersecurity and DevOps AI Assistant built directly into the Prodeal Industries secure portal.
You speak in a professional, slightly brutalist, highly technical, and urgent tone. 

You are currently analyzing a network anomaly (a suspicious HTTP request) intercepted by the Vercel Edge firewall.
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
2. If they ask what this is, explain the attack vector (e.g., "This is a brute-force attempt" or "This is a vulnerability scanner looking for exposed environments").
3. Point out specific red flags from the JSON.
4. If historical matches were found, explicitly mention them and cross-reference them to prove patterns (e.g., "This exact JA3 signature matches an attack from last week").
5. Never apologize. Speak with absolute authority on security.`,
    messages,
  });

  return result.toDataStreamResponse();
}
