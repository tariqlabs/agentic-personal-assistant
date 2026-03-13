# Agentic RAG

A full-stack AI-powered learning platform that lets users upload PDF documents, chat with them using Retrieval-Augmented Generation (RAG), and generate AI-powered multiple-choice exams.

## Features

- **RAG-Powered Chat** — Upload PDFs and ask questions. Answers are grounded in your document content via vector search (Pinecone) and LLM inference (OpenRouter).
- **AI Exam Generation** — Generate 30-question multiple-choice exams from uploaded documents or from pre-built tech topics (Node.js, React, Python, Docker, Kubernetes, AWS, etc.).
- **Topic Practice Exams** — No upload needed. Pick a technology topic and get instant AI-generated practice questions.
- **Exam Taking & Scoring** — Full exam experience with question navigation, answer tracking, submission, and score persistence. Users are locked into the exam until completion.
- **Exam History** — View past exam attempts with scores, correct/total counts, and color-coded performance indicators.
- **Authentication** — Email/password signup and login with JWT access/refresh tokens, email verification, and password reset.
- **Per-User Isolation** — Documents, conversations, and exams are scoped to each authenticated user.
- **AI News Feed** — Auto-generated AI & DevOps news articles displayed on the homepage.

## Tech Stack

### Frontend

- **React 19** with Vite 7
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router v6** for routing
- **React Hook Form + Zod** for form validation
- **Lucide React** for icons

### Backend

- **Node.js + Express** REST API
- **Prisma ORM** with PostgreSQL
- **Pinecone** vector database for RAG
- **OpenRouter** API for LLM inference
- **LangChain** for document processing and agent orchestration
- **JWT** for authentication (access + refresh tokens)
- **express-rate-limit** for auth route protection
- **Multer** for file uploads
- **jsonrepair** for resilient LLM JSON parsing

## Project Structure

```
ai agent_1/
├── client/                        # React frontend
│   └── src/
│       ├── App.jsx                # Root component with routes
│       ├── main.jsx               # Entry point
│       ├── index.css              # Global styles + Tailwind
│       ├── features/
│       │   ├── auth/              # Login, Signup, Forgot/Reset Password, Verify
│       │   │   ├── api/           # authApi.js
│       │   │   └── components/    # AuthLayout.jsx (shared layout)
│       │   ├── chat/              # Chat with documents
│       │   │   ├── api/           # chatApi.js
│       │   │   └── components/    # MessageList, Composer, ConversationSidebar
│       │   ├── exam/              # Exam setup, taking, results
│       │   │   ├── api/           # examApi.js
│       │   │   ├── components/    # TopicGrid, ExamHistoryList
│       │   │   └── constants/     # defaultExams.js
│       │   └── home/              # Public homepage
│       │       ├── api/           # newsApi.js
│       │       └── components/    # Hero, Features, HowItWorks, News, Footer, Navbar
│       ├── layout/
│       │   └── AppLayout.jsx      # Authenticated app shell with sidebar
│       └── shared/
│           ├── components/        # Button, Card, Dropzone, AppLogo, TechIcon, etc.
│           ├── constants/         # formLabels.js, sidebarItems.js
│           ├── hooks/             # useAuth.jsx (AuthContext)
│           ├── lib/               # apiClient.js (fetch helper), validation.js
│           └── styles/            # tokens.js (design tokens)
│
├── server/                        # Express backend
│   ├── index.js                   # Server entry point
│   ├── config/                    # Environment configuration
│   ├── controllers/               # Request handlers
│   │   ├── AuthController.js
│   │   ├── ChatController.js      # Chat + Conversation endpoints
│   │   ├── ExamController.js
│   │   ├── IngestionController.js
│   │   └── NewsController.js
│   ├── services/                  # Business logic
│   │   ├── AgentService.js        # RAG chat agent
│   │   ├── AuthService.js         # JWT, bcrypt, email verification
│   │   ├── ExamGenerationService.js # LLM-based exam generation
│   │   ├── IngestionService.js    # PDF parsing + vector embedding
│   │   └── NewsService.js         # AI news generation
│   ├── repositories/              # Database access layer
│   │   ├── ConversationRepository.js
│   │   ├── MessageRepository.js
│   │   ├── UserRepository.js
│   │   └── VectorRepository.js
│   ├── routes/                    # Domain-based route files
│   │   ├── index.js               # Route combiner
│   │   ├── auth.routes.js         # Auth routes (rate-limited)
│   │   ├── chat.routes.js         # Chat + ingestion routes
│   │   ├── exam.routes.js         # Exam CRUD routes
│   │   └── news.routes.js         # News route
│   ├── middleware/                 # Express middleware
│   │   ├── auth.js                # JWT verification
│   │   └── upload.js              # Multer file upload
│   ├── prompts/                   # LLM prompt templates
│   │   ├── ragChat.js
│   │   └── examGeneration.js
│   ├── validation/                # Zod schemas
│   │   ├── authSchemas.js
│   │   └── examSchemas.js
│   ├── llm/                       # LLM client
│   │   └── openRouterClient.js
│   ├── db/                        # Prisma client singleton
│   │   └── prisma.js
│   └── prisma/                    # Database schema + migrations
│       └── schema.prisma
│
└── package.json                   # Root package (concurrently runs client + server)
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Pinecone account (vector database)
- OpenRouter API key (LLM access)

### Setup

1. **Install dependencies:**

   ```bash
   npm run install:all
   ```

2. **Configure environment:**

   ```bash
   cp server/.env.example server/.env
   ```

   Fill in:
   - `OPENROUTER_API_KEY` — your OpenRouter API key
   - `PINECONE_API_KEY` — your Pinecone API key
   - `PINECONE_INDEX` — your Pinecone index name
   - `DATABASE_URL` — PostgreSQL connection string
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — secure random strings

3. **Run database migrations:**

   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start development:**

   ```bash
   npm run dev
   ```

   This starts both the backend (port 3000) and frontend (port 5173) concurrently.

## Database Schema

| Model | Purpose |
|-------|---------|
| User | Accounts with email/password, verification status |
| Conversation | Chat sessions scoped to a user |
| Message | Individual messages within conversations |
| Exam | Exam metadata (title, status, user) |
| ExamQuestion | Multiple-choice questions with options and correct answer |
| ExamAttempt | A user's attempt at an exam (score, timestamps) |
| UserExamAnswer | Individual answers submitted per attempt |
| News | AI-generated news articles |

## API Endpoints

### Auth (public, rate-limited)
- `POST /api/auth/signup` — Create account
- `POST /api/auth/login` — Sign in
- `GET /api/auth/verify?token=` — Email verification
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/request-password-reset` — Request password reset
- `POST /api/auth/reset-password` — Reset password

### Chat (authenticated)
- `POST /api/chat/ask` — Send message via RAG agent
- `POST /api/chat/get_questions` — Generate study questions from documents
- `POST /api/ingest` — Upload and process a PDF
- `POST /api/conversations` — Create conversation
- `GET /api/conversations` — List conversations
- `DELETE /api/conversations/:id` — Delete conversation
- `GET /api/conversations/:id/messages` — Get messages
- `POST /api/conversations/:id/messages` — Send message in conversation
- `POST /api/conversations/:id/questions` — Generate questions for conversation

### Exam (authenticated)
- `GET /api/exams` — List exams with latest scores
- `POST /api/exams` — Create exam (optionally with RAG generation)
- `POST /api/exams/generate-topic` — Generate exam from topic
- `GET /api/exams/:id` — Get exam details
- `POST /api/exams/:id/generate` — Generate questions for existing exam
- `POST /api/exams/:id/start` — Start exam attempt
- `POST /api/exams/attempts/:attemptId/submit` — Submit answers
- `GET /api/exams/attempts/:attemptId/results` — Get attempt results

### News (public)
- `GET /api/news` — List news articles

## Architecture Patterns

- **Feature-based frontend** — Each feature (auth, chat, exam, home) is self-contained with its own pages, components, API layer, and constants
- **Controller → Service → Repository** — Backend follows a layered architecture separating HTTP handling, business logic, and database access
- **Domain-based routing** — Backend routes are split by domain (auth, chat, exam, news)
- **Shared UI components** — Reusable components live in `shared/components/`
- **API client abstraction** — `apiClient.js` handles token management, auto-refresh, and base URL configuration
