import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, data } = await req.json();
  
  const anomalyData = data?.anomalyContext ? JSON.stringify(data.anomalyContext, null, 2) : "No context provided.";

  const result = await streamText({
    model: google('gemini-1.5-pro'),
    system: `You are a highly advanced Cybersecurity and DevOps AI Assistant built directly into the Prodeal Industries secure portal.
You speak in a professional, slightly brutalist, highly technical, and urgent tone. 

You are currently analyzing a network anomaly (a suspicious HTTP request) intercepted by the Vercel Edge firewall.
Here is the raw JSON metadata of the anomaly the user is currently looking at:
\`\`\`json
${anomalyData}
\`\`\`

When responding:
1. Be extremely concise. B2B engineers don't have time for fluff.
2. If they ask what this is, explain the attack vector (e.g., "This is a brute-force attempt" or "This is a vulnerability scanner looking for exposed environments").
3. Point out specific red flags from the JSON (e.g., "Note the spoofed User-Agent: Chaos-Monkey" or "The JA3 fingerprint matches known botnets").
4. Never apologize. Speak with absolute authority on security.`,
    messages,
  });

  return result.toDataStreamResponse();
}
