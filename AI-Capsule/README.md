# AI Capsule

Cloud-deployed AI Prompt Manager — CSE3CWA-5006 Assignment 3.

## Live deployment
- **URL**: https://ai-capsule-dnee.onrender.com
- **Platform**: Render (free web service)

## Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite (via better-sqlite3)
- Auth: GitHub OAuth (Passport.js) → Express-issued application JWT

## Project structure

AI-Capsule/
├── backend/ Express API, OAuth, JWT, SQLite
└── frontend/ React app (Vite)


## Installation & running locally

**Backend**

cd backend
npm install
npm run dev

Runs on http://localhost:5000

**Frontend**

cd frontend
npm install
npm run dev

Runs on http://localhost:5173

For local dev, the frontend dev server (5173) talks to the backend (5000) directly. In production, Express serves the built frontend itself from one origin.

## Environment variables
Set in `backend/.env` locally, and in Render's Environment tab for deployment. Names only — no secret values here:

- `PORT`
- `NODE_ENV`
- `JWT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`

## API routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Starts GitHub OAuth |
| `/dashboard` | Protected | User's capsule records |
| `/api/health` | Public | Returns `{ "status": "ok" }` |
| `GET /api/capsules` | Protected | Read own records |
| `POST /api/capsules` | Protected | Create record |
| `PUT /api/capsules/:id` | Protected | Update own record |
| `DELETE /api/capsules/:id` | Protected | Delete own record |

The React frontend communicates with Express entirely through `fetch` calls with `credentials: 'include'`, so the HttpOnly JWT cookie is sent automatically on every request.

## OAuth & JWT flow
1. User clicks "Log in with GitHub" → hits `/login`, which starts the GitHub OAuth flow via Passport.
2. GitHub redirects back to `/auth/github/callback` after the user authorizes.
3. Express verifies the GitHub identity, then **issues its own application JWT** (`jsonwebtoken`, signed with `JWT_SECRET`) containing the GitHub user ID and username.
4. That JWT is stored in a `Secure`, `HttpOnly` cookie named `token` — never exposed to frontend JavaScript, never in localStorage.
5. All `/api/capsules` routes run through `requireAuth` middleware, which verifies the JWT from the cookie on every request and attaches the decoded user to `req.user`.
6. `user_id` for every capsule record comes from `req.user.id` (the verified JWT) — never from the request body, so ownership can't be spoofed by the client.

## Database
SQLite via `better-sqlite3`, schema in `backend/db/schema.sql`, auto-created on first run. **Storage on Render's free tier is ephemeral** — the local filesystem resets on redeploy/restart, so capsule data does not persist across deploys. This is a known limitation of the free tier and is documented here as required.

## Required cURL tests (against the deployed URL)

curl -i https://ai-capsule-dnee.onrender.com/api/capsules

Result: `401 Unauthorized`

curl -i -H "Cookie: token=fake-token-123" https://ai-capsule-dnee.onrender.com/api/capsules

Result: `401 Unauthorized`

## AI-assisted development
- **Tool used**: Claude (Anthropic)
- **Problem found and corrected**: During deployment, GitHub OAuth logins were failing in production with an `AuthorizationError` and, separately, an "Invalid Redirect URI" screen from GitHub. Debugging via Render's live logs showed the app was generating a redirect URI pointing at the wrong Render domain — the `GITHUB_CALLBACK_URL` environment variable still referenced `ai-capsule.onrender.com` instead of the actual assigned domain, `ai-capsule-dnee.onrender.com` (Render appended a suffix because the plain name was already taken). Updating the environment variable and the GitHub OAuth app's registered callback URL to match resolved it.
- **How OAuth/JWT/protected API behaviour was verified**: manual testing via browser (full login → dashboard flow) and via cURL against the deployed URL with no cookie and with a fake cookie, confirming 401 in both cases.
- **How CRUD and ownership were verified**: manually created, edited, and deleted capsule records through the live dashboard UI; confirmed records are scoped to the authenticated user's GitHub ID via the verified JWT, not client input.
- **Implementation/deployment decision**: chose to serve the built React frontend directly from the Express backend on a single origin, rather than deploying frontend and backend separately. This avoided cross-origin cookie and CORS configuration, which matters here since the JWT has to travel as a Secure, HttpOnly cookie.

## One honest limitation
Data storage is not persistent on Render's free tier — SQLite writes to the local filesystem, which is wiped on every redeploy or restart. For this assignment's scope that's acceptable and disclosed, but a production version would need Render's managed PostgreSQL or an equivalent persistent database.