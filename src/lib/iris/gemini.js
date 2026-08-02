import { escapeXml } from './prompt.js';
import { GEMINI_MODEL_NAME } from './config.js';

export async function streamGeminiContent(promptText, apiKey, onTokenChunk) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_NAME}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API stream error [${response.status}]: ${errText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const candidate = parsed.candidates?.[0];
          const textChunk = candidate?.content?.parts?.[0]?.text || '';

          if (textChunk) {
            fullText += textChunk;
            if (onTokenChunk) {
              onTokenChunk(textChunk);
            }
          }
        } catch (e) {
          // Ignore JSON parse chunk errors
        }
      }
    }
  }

  return fullText;
}

/**
 * Fallback static generator if Gemini API key is missing or fails
 */
export function generateFallbackAnswer(question, retrievedDocs) {
  if (retrievedDocs.length === 0) {
    return 'Maaf ya, aku belum menemukan data mengenai pertanyaan tersebut di database IRIS saat ini.';
  }

  const items = retrievedDocs.map((doc, idx) => {
    const title = doc.title || 'Informasi';
    const snippet = doc.snippet || '';
    return `- **${title}**: ${snippet}`;
  });

  return `Nih, data yang aku temukan di IRIS (${retrievedDocs[0].source_table}):\n\n${items.join('\n\n')}\n\nSemoga membantu ya! Ada yang mau kamu tanyakan lagi?`;
}
