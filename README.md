# Scientific Journal Publication Trend Tracking System

A full-stack metadata-only platform for tracking scientific publication trends. It helps researchers, lecturers, students, and administrators search scholarly paper metadata, monitor keyword/topic/journal growth, bookmark papers, receive notifications, and manage academic API data sources.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router DOM, Axios, TanStack Query, Recharts, Lucide React, React Hook Form, Zod, Sonner, Zustand.
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, dotenv, cors, helmet, morgan, express-rate-limit, axios, node-cron, Joi, http-errors, cookie-parser.
- External metadata API used by the app: Semantic Scholar.

## Project Structure

```txt
backend/
  bin/www
  config/db.js
  controllers/
  middlewares/
  models/
  routes/
  services/
  jobs/
  utils/
  seed/seed.js
  app.js
frontend/
  src/
    api/
    components/
    features/
    hooks/
    layouts/
    lib/
    pages/
    routes/
    stores/
    types/
```

## Setup

Backend:

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend runs on `http://localhost:5173`.

## Environment Variables To Edit

Backend `.env`:

- `MONGODB_URI`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `CLIENT_URL`
- `OPENALEX_CONTACT_EMAIL`
- `CROSSREF_MAILTO`
- `SEMANTIC_SCHOLAR_API_KEY` if enabling Semantic Scholar
- `SYNC_CRON`
- `DEFAULT_SYNC_KEYWORDS`

Frontend `.env`:

- `VITE_API_URL`
- `VITE_APP_NAME`
- `VITE_GOOGLE_CLIENT_ID`

## Academic API

- Semantic Scholar: set `SEMANTIC_SCHOLAR_ENABLED=true` and add `SEMANTIC_SCHOLAR_API_KEY`.
- OpenAlex and Crossref service files remain available for future extension, but the current search/sync flow uses Semantic Scholar only.

Semantic Scholar API keys are requested from the Semantic Scholar API portal. Approved free keys may be limited to 1 request per second, so the backend includes a small wait and retry for `429` rate-limit responses.

## Demo Accounts

All demo passwords are `123456`.

- Admin: `admin@sjtts.com`
- Researcher: `researcher@sjtts.com`
- Lecturer: `lecturer@sjtts.com`
- Student: `student@sjtts.com`

## API Routes

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- Papers: `GET /api/papers`, `GET /api/papers/:id`, `GET /api/papers/search`, `POST /api/papers/sync`
- Trends: `GET /api/trends/overview`, `GET /api/trends/by-keyword`, `GET /api/trends/by-topic`, `GET /api/trends/by-journal`, `GET /api/trends/emerging`
- Journals: `GET /api/journals`, `GET /api/journals/:id`, `GET /api/journals/:id/trends`
- Keywords: `GET /api/keywords`, `GET /api/keywords/popular`, `GET /api/keywords/:keyword/trends`, `POST /api/keywords/follow`, `DELETE /api/keywords/follow/:keyword`
- Topics: `GET /api/topics`, `GET /api/topics/popular`, `GET /api/topics/emerging`
- Bookmarks: `GET /api/bookmarks`, `POST /api/bookmarks`, `DELETE /api/bookmarks/:id`, `PATCH /api/bookmarks/:id`
- Notifications: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`
- Dashboard: `GET /api/dashboard/summary`, `GET /api/dashboard/researcher`, `GET /api/dashboard/basic`
- Admin: `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`, `PATCH /api/admin/users/:id/role`, `GET /api/admin/data-sources`, `POST /api/admin/data-sources`, `PATCH /api/admin/data-sources/:id`, `POST /api/admin/sync/run`, `GET /api/admin/sync/logs`

## Limitations

- The system processes metadata only.
- It does not download, store, or analyze full-text papers.
- Seed data does not create mock papers; it fetches real metadata from Semantic Scholar when configured.
- Search and trend freshness depend on third-party API availability and rate limits.
- Data sync is scheduled, not realtime.
