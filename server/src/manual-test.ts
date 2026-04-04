import { OpenAI } from 'openai';

const client = new OpenAI({
  baseURL: 'https://gemini-web-api-c35l.onrender.com/v1',
  apiKey: 'sk-gemini',
});

async function main() {
  console.log('--- START TEST ---');
  try {
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: 'Say Hello' }],
      model: 'gemini-3.0-flash',
    });
    console.log('SUCCESS:', chatCompletion.choices[0].message.content);
  } catch (error: any) {
    console.log('ERROR STATUS:', error.status);
    console.log('ERROR MESSAGE:', error.message);
    if (error.response) {
      console.log('RAW RESPONSE:', error.response.data);
    }
  }
  console.log('--- END TEST ---');
}

main();
