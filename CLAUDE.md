# CLAUDE.md — AI Agent Development Guide

This file provides the AI assistant with full context on how this project is structured, developed, and maintained.

## Project Overview

**Agentic RAG** is a full-stack AI learning platform. Users upload PDFs, chat with them via RAG (Retrieval-Augmented Generation), and take AI-generated exams. The frontend is React (Vite), the backend is Node.js/Express, the database is PostgreSQL (via Prisma), vector search uses Pinecone, and LLM inference goes through OpenRouter.

## Monorepo Layout

```
ai agent_1/
├── client/         # React frontend (Vite)
├── server/         # Express backend
├── package.json    # Root — runs both with `concurrently`
```

- `npm run dev` starts both client (port 5173) and server (port 3000).
- `npm run install:all` installs root + server + client deps.

## Frontend Architecture

### Feature-Based Structure

Every feature lives in `client/src/features/<feature>/`:

```
features/<feature>/
├── <FeaturePage>.jsx         # Page component
├── api/
│   └── <feature>Api.js       # API calls for this feature
├── components/
│   └── *.jsx                 # Feature-specific components
└── constants/                # (optional) Feature-specific data
```

Current features: `auth`, `chat`, `exam`, `home`.

### Shared Code

```
shared/
├── components/   # Reusable UI: Button, Card, Dropzone, AppLogo, TechIcon, Upload
├── constants/    # formLabels.js, sidebarItems.js
├── hooks/        # useAuth.jsx (AuthContext with JWT management)
├── lib/          # apiClient.js (fetch wrapper), validation.js (Zod schemas)
└── styles/       # tokens.js (design tokens)
```

### Key Libraries

| Library | Use |
|---------|-----|
| React 19 | UI framework |
| Vite 7 | Build tool |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion | Animations |
| React Router v6 | Client-side routing |
| React Hook Form + Zod | Form validation |
| Lucide React | Icons |
| simple-icons | Technology brand icons |

### Routing (App.jsx)

```
/                   → HomePage
/auth/login         → LoginPage
/auth/signup        → SignupPage
/auth/forgot        → ForgotPasswordPage
/auth/reset         → ResetPasswordPage
/auth/verify        → VerifyPage
/app                → AppLayout shell
/app/chat           → ChatLayout
/app/exam           → ExamSetupPage
/app/exam/:id       → ExamPage (locked during exam)
/app/exam/:id/results → ExamResultsPage
```

### API Client (`shared/lib/apiClient.js`)

All API calls go through helper functions:
- `fetchWithAuth(url, options)` — attaches JWT, auto-refreshes on 401
- `fetchPublic(url, options)` — no auth required
- `fetchWithToken(url, options)` — one-time token use

Tokens are stored in `localStorage` (`access_token`, `refresh_token`).

### Styling Rules

- Dark theme with `bg-[#020617]` as the primary background
- Consistent color palette defined in `shared/styles/tokens.js`
- All pages use Tailwind utility classes
- Custom SVG components for branding (`AppLogo`, `favicon.svg`)

## Backend Architecture

### Layered Structure

```
server/
├── routes/          # HTTP route definitions (domain-based)
├── controllers/     # Request handling + response formatting
├── services/        # Business logic
├── repositories/    # Database access (Prisma)
├── middleware/       # auth.js (JWT verify), upload.js (Multer)
├── validation/      # Zod schemas for request validation
├── prompts/         # LLM prompt templates
├── llm/             # OpenRouter client
├── config/          # Environment config
└── db/              # Prisma client singleton
```

### Request Flow

```
Route → Middleware (auth, upload) → Controller → Service → Repository/LLM
```

### Domain Organization

| Domain | Controller | Service | Routes |
|--------|-----------|---------|--------|
| Auth | AuthController | AuthService | auth.routes.js |
| Chat | ChatController | AgentService | chat.routes.js |
| Exam | ExamController | ExamGenerationService | exam.routes.js |
| Ingestion | IngestionController | IngestionService | chat.routes.js |
| News | NewsController | NewsService | news.routes.js |

### LLM Configuration

- Provider: **OpenRouter** (`server/llm/openRouterClient.js`)
- Models configured in `.env`:
  - `OPENROUTER_MODEL` — main chat model
  - `OPENROUTER_QUESTIONS_MODEL` — exam generation model
- Prompt templates in `server/prompts/`
- JSON output parsing with `jsonrepair` for resilient LLM response handling

### Database (Prisma + PostgreSQL)

Schema at `server/prisma/schema.prisma`. Key models:
- `User` → has conversations, exams, attempts
- `Conversation` → has messages
- `Exam` → has questions, belongs to user
- `ExamAttempt` → tracks score, links to user answers
- `ExamQuestion` → stores question text, options JSON, correct answer

Migrations: `cd server && npx prisma migrate dev`

### Authentication

- JWT-based (access token 15min, refresh token 7d)
- Middleware at `server/middleware/auth.js` verifies access token
- Refresh via `POST /api/auth/refresh`
- Auth routes are rate-limited (`express-rate-limit`)

## Development Rules

### Code Style

- **No narration comments** — Do NOT add comments that describe what code does. Only explain non-obvious intent, trade-offs, or constraints.
- **Max ~350 lines per file** — Break large files into smaller components or modules.
- **Use map() for repeated UI** — When rendering lists of similar items, define data arrays/objects in constants files and use `.map()` to render them.
- **Feature isolation** — Each feature folder should be self-contained. Cross-feature imports go through `shared/`.

### File Naming

- Pages: `<Feature>Page.jsx` (e.g., `ExamSetupPage.jsx`)
- Components: `PascalCase.jsx` (e.g., `TopicGrid.jsx`)
- API files: `<feature>Api.js` (e.g., `examApi.js`)
- Constants: `camelCase.js` (e.g., `defaultExams.js`)
- Backend routes: `<domain>.routes.js` (e.g., `exam.routes.js`)
- Backend schemas: `<domain>Schemas.js` (e.g., `examSchemas.js`)

### Adding a New Feature

1. Create `client/src/features/<name>/` with the page, `api/`, and `components/` folders.
2. Add API functions in `api/<name>Api.js` using `fetchWithAuth` or `fetchPublic`.
3. Add routes in `App.jsx`.
4. On the backend: create a route file in `server/routes/`, controller in `controllers/`, service in `services/`.
5. Register the route in `server/routes/index.js`.
6. If DB models are needed, update `prisma/schema.prisma` and run migrations.

### Adding a New API Endpoint

1. Define the route in the appropriate `server/routes/<domain>.routes.js`.
2. Create the handler in the relevant controller.
3. Business logic goes in the relevant service.
4. Database access goes through a repository.
5. Add the frontend API call in the feature's `api/` folder.

### Environment Variables

All env vars live in `server/.env` (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| OPENROUTER_API_KEY | LLM API key |
| OPENROUTER_MODEL | Default LLM model |
| OPENROUTER_QUESTIONS_MODEL | Exam generation model |
| OPENROUTER_BASE_URL | OpenRouter endpoint |
| OPENROUTER_TEMPERATURE | LLM temperature |
| PINECONE_API_KEY | Vector DB key |
| PINECONE_INDEX | Vector index name |
| DATABASE_URL | PostgreSQL connection |
| JWT_ACCESS_SECRET | Access token secret |
| JWT_REFRESH_SECRET | Refresh token secret |
| JWT_ACCESS_EXPIRES_IN | Access token TTL |
| JWT_REFRESH_EXPIRES_IN | Refresh token TTL |

### Common Pitfalls

- **Import paths after restructuring** — The frontend uses feature-based imports. Shared code lives in `shared/`. When moving files, always update all import paths.
- **LLM JSON parsing** — LLM responses often contain malformed JSON. The backend uses `jsonrepair` before parsing. Always handle parse failures gracefully.
- **Exam generation timeouts** — Generating 30 questions takes time. The frontend `examApi.js` uses `AbortController` with a timeout. Keep backend and frontend timeouts aligned.
- **Server restart** — The backend uses `node index.js` (not nodemon). After backend file changes, manually restart the server.
- **Z-index layering** — The AppLayout sidebar uses a high z-index. Pages like `ExamPage` that need to overlay the sidebar use `z-[60]` or higher.

### Testing

- Use Playwright (`@playwright/test`) for E2E testing.
- Test user: create via signup flow or seed database.
- Login URL: `/auth/login`
- After login, the app redirects to `/app/chat`.

## Key Design Decisions

1. **OpenRouter over direct model APIs** — Single API key accesses hundreds of models. Easy to swap models without code changes.
2. **Pinecone for vectors** — Managed vector DB with no infrastructure overhead.
3. **Feature-based frontend** — Scales better than component-type grouping. Each feature is independently developable.
4. **Controller/Service/Repository backend** — Clear separation of concerns. Controllers never touch the DB directly.
5. **JWT with refresh tokens** — Stateless auth with auto-renewal. No session storage needed.
6. **jsonrepair for LLM output** — LLMs frequently produce almost-valid JSON. Repairing is more reliable than re-prompting.
