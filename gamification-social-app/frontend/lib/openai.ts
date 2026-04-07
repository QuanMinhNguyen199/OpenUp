// tạm thời bỏ file này
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://models.inference.ai.azure.com/'
});