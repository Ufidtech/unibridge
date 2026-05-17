# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Backend

The repo now includes an Express backend in [backend/](backend) for the AI chat and core app resources. It uses Firebase Admin with Firestore for persistence and Firebase Auth tokens for protected routes.

Available routes:

- `POST /api/auth/register/mentor`
- `POST /api/auth/register/mentee`
- `POST /api/auth/verify-token`
- `GET /api/auth/me`
- `GET /api/health`
- `GET /api/mentors`
- `GET` and `POST /api/sessions`
- `GET` and `POST /api/contact`
- `POST /api/ai/mentor-response`

Frontend notes

- Mentor cards now show a short "Why this mentor?" breakdown when the backend returns `breakdown` details. The breakdown explains which signals contributed to the recommendation (course match, skills, shared vibes, availability score).
- The AI Command Center sends free-text questions to `/api/ai/mentor-response` and displays the assistant reply in the chat UI.

Setup:

1. Copy [backend/.env.example](backend/.env.example) to `backend/.env` and set the Firebase project and service-account fields plus `GEMINI_API_KEY`.
2. Run `npm run backend:dev` from the repo root.
3. Keep the Vite frontend running with `npm run dev`; `/api` requests are proxied to `http://localhost:3001` in development.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
