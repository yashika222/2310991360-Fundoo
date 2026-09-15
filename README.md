# FundooNotes Backend

Production-ready Google Keep clone API: Next.js 14 Route Handlers, MongoDB/Mongoose, JWT (access + refresh + 1-hour reset), Winston, and Swagger.

## User stories covered

| ID | Capability | Acceptance |
| --- | --- | --- |
| US-01 | Register | Unique email, password ≥ 8 chars, bcrypt 10 rounds |
| US-02 | Login | Access JWT, httpOnly cookie, refresh token |
| US-03 | Forgot password | 32-byte crypto token, SHA-256 stored, 1 hour expiry |
| US-04 | Reset password | Valid + unexpired token, re-hash password |
| US-05 | Notes CRUD | Owner/collaborator checks, pagination, color enum |
| US-06 | Archive / trash | `isArchived`, `isDeleted` soft delete |
| US-07 | Collaborators | Email array, max 10 |
| US-08 | Labels | String array, `?label=` filter |

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set `MONGODB_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` (each secret ≥ 32 characters).

Without SMTP, forgot-password returns a `token` in development so you can test reset locally. Logs go to `logs/` (local) or stdout (Vercel).

## Endpoints

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/health` | No |
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| POST | `/api/auth/refresh` | Refresh cookie/body |
| POST | `/api/auth/logout` | No |
| POST | `/api/auth/forgot-password` | No |
| POST | `/api/auth/reset-password` | No |
| GET/POST | `/api/notes` | Bearer or cookie |
| GET/PUT/DELETE | `/api/notes/:id` | Bearer or cookie |
| PATCH | `/api/notes/:id/archive` | Owner |
| PATCH | `/api/notes/:id/trash` | Owner |
| PATCH | `/api/notes/:id/restore` | Owner |

OpenAPI UI: [`/api-docs`](http://localhost:3000/api-docs)  
Spec JSON: [`/api/docs`](http://localhost:3000/api/docs)  
Postman: `postman/FundooNotes.postman_collection.json`

## Deploy

1. Put env vars on Vercel (`MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `APP_URL`).
2. Atlas network access: Vercel IPs or `0.0.0.0/0` for a first deploy.
3. `GET /api/health` should return `{ status: "ok", db: "connected" }`.

CI lints and builds on push (`.github/workflows/ci.yml`).
