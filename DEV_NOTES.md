Local development notes

Firebase client config (Vite):

- The frontend expects the following Vite env variables to be set (create `.env.local` at the repository root):
  - VITE_FIREBASE_API_KEY
  - VITE_FIREBASE_AUTH_DOMAIN
  - VITE_FIREBASE_PROJECT_ID
  - VITE_FIREBASE_APP_ID

- Example `.env.local` (already included in this repo):

  VITE_FIREBASE_API_KEY=your-firebase-api-key
  VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=your-project-id
  VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456

Backend Firebase Admin vs Mock:

- The backend prefers a real Firebase service account JSON via environment variable `FIREBASE_SERVICE_ACCOUNT_JSON` or a file in `backend/serviceAccountKey.json`.
- If the service account is not provided, the backend uses a built-in in-memory mock so you can run locally without credentials. This mock supports basic auth and Firestore operations used by tests and the demo.

AI keys:

- To enable Gemini (Google Generative AI) you can set `GEMINI_API_KEY` in `backend/.env` or the system environment. Without this key the backend returns helpful fallback text.

Proxy / dev server notes:

- If you run the frontend dev server using `pnpm run dev`, ensure API requests to `/api/*` are proxied to the backend (Vite config) or use the backend origin directly (for example, http://localhost:3001/api/... ).

Security note:

- Do NOT commit real API keys or service account JSON to the repository. Use `.env.local` (ignored by Git) and keep secrets out of source control.
