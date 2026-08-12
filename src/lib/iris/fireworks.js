export async function streamFireworksContent(promptText, systemPrompt, apiKey, onTokenChunk) {
  const endpoint = 'https://api.fireworks.ai/inference/v1/chat/completions';
  const model = process.env.FIREWORKS_MODEL_NAME || 'accounts/fireworks/models/deepseek-v4-flash-0731';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptText },
      ],
      stream: true,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Fireworks API error [${response.status}]: ${errText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep the last incomplete line in the buffer

    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('data: ')) {
        if (line === 'data: [DONE]') continue;

        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const textChunk = parsed.choices?.[0]?.delta?.content || '';

          if (textChunk) {
            fullText += textChunk;
            if (onTokenChunk) {
              onTokenChunk(textChunk);
            }
          }
        } catch (e) {
          // Ignore JSON parse errors for incomplete chunks
        }
      }
    }
  }

  return fullText;
}
