import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function callGroqAgent(
  prompt: string,
  systemRole: string,
  temperature: number = 0.3,
  maxTokens: number = 1000
): Promise<string> {
  try {
    const message = await groq.messages.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: maxTokens,
      temperature,
      system: systemRole,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    return textContent.text;
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

export default groq;
