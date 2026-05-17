# Backend — unibridge

This folder contains a minimal Express backend used by the unibridge frontend.

Local dev conveniences

- If `backend/.env` contains a `FIREBASE_SERVICE_ACCOUNT_JSON` value (the JSON string for a Firebase service account key) the real Firebase Admin SDK will be used.
- If no service account JSON is provided, the server falls back to an in-memory mock for Auth and Firestore so you can run and test locally without a Firebase project.
- AI replies use the Gemini API when `GEMINI_API_KEY` is set. Otherwise the `/api/ai/mentor-response` route returns a helpful fallback message.

Run locally

Open a terminal in the repo root:

```powershell
# install backend deps
npm --prefix .\backend install

# start backend (nodemon recommended for dev)
npm run backend:dev
```

Quick smoke test (requires the server running):

```powershell
node .\backend\tests\smokeTest.js
```

Notes

- The in-memory mock is intended for local development and testing only; it is not durable and not for production use.
- To enable real Firebase: create a service account key JSON in the Firebase console and set `FIREBASE_SERVICE_ACCOUNT_JSON` in `backend/.env` (or in your environment). Restart the server after setting env vars.
