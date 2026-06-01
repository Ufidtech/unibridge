import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env whether this script is run from repo root or backend/
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('Missing GEMINI_API_KEY (or VITE_GEMINI_API_KEY).');
  process.exit(1);
}

async function main() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw Object.assign(new Error(data?.error?.message || 'Failed to list models'), {
        status: response.status,
        response: data,
      });
    }

    const models = Array.isArray(data?.models) ? data.models : [];

    console.log('Available Gemini models:');
    for (const model of models) {
      console.log(JSON.stringify(model, null, 2));
    }
  } catch (error) {
    console.error('RAW GOOGLE ERROR:', error);
    console.error('RAW GOOGLE ERROR MESSAGE:', error?.message);
    console.error('RAW GOOGLE ERROR STATUS:', error?.status || error?.response?.status);
    console.error('RAW GOOGLE ERROR RESPONSE:', error?.response);
    process.exit(1);
  }
}

main();
