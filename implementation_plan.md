# RoadmapHub (MERN Stack Implementation Plan)

Build a complete, production-style MVP of a customer feedback and public roadmap platform using the MERN stack, as outlined in the detailed specifications.

## 1. Final Folder Structure

A split architecture with separate `frontend` and `backend` directories.

```text
RoadmapHub/
├── backend/
│   ├── src/
│   │   ├── config/ (env.ts, db.ts)
│   │   ├── models/ (User.ts, FeatureRequest.ts, Comment.ts)
│   │   ├── modules/
│   │   │   ├── auth/ (controller, service, routes, validation)
│   │   │   ├── features/ (controller, service, routes, validation)
│   │   │   ├── votes/ (controller, service, routes)
│   │   │   ├── comments/ (controller, service, routes, validation)
│   │   │   └── admin/ (controller, service, routes)
│   │   ├── middleware/ (auth, admin, error, notFound)
│   │   ├── utils/ (jwt, password, apiResponse)
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/ (router.tsx, providers.tsx, queryClient.ts)
    │   ├── components/ (ui, layout, common, feature, comments, roadmap)
    │   ├── pages/ (auth, admin, main pages)
    │   ├── features/ (auth, feature-requests, comments, roadmap, admin)
    │   ├── hooks/
    │   ├── lib/ (api.ts, utils.ts, markdown.ts)
    │   ├── types/
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.ts
    └── tsconfig.json
```

## 2. Dependency List

### Backend Dependencies
- **Core:** `express`, `mongoose`, `cors`, `cookie-parser`, `dotenv`
- **Security:** `bcryptjs` (or `argon2`), `jsonwebtoken`, `zod`
- **Dev:** `typescript`, `@types/node`, `@types/express`, `@types/cors`, `@types/cookie-parser`, `@types/jsonwebtoken`, `@types/bcryptjs`, `tsx` (or `nodemon` + `ts-node`), `eslint`, `prettier`

### Frontend Dependencies
- **Core:** `react`, `react-dom`, `react-router-dom`
- **State & Data Fetching:** `@tanstack/react-query`, `axios`
- **Forms & Validation:** `react-hook-form`, `@hookform/resolvers`, `zod`
- **Styling & UI:** `tailwindcss`, `lucide-react`, `clsx`, `tailwind-merge`
- **Markdown:** `react-markdown`, `remark-gfm`, `dompurify` (for sanitization)
- **Dev:** `vite`, `typescript`, `@types/react`, `@types/react-dom`, `@types/dompurify`, `eslint`, `prettier`

## 3. Database Schema Plan (Mongoose)

### User Schema
- `name`, `email` (unique, lowercase), `passwordHash`, `role` (user/admin), `isEmailVerified`
- Optional hashes for refresh token, password reset, and email verification
- Timestamps

### FeatureRequest Schema
- `title`, `descriptionMarkdown`, `category` (UI/UX, Integrations, Performance, General)
- `status` (under_review, planned, in_progress, completed)
- `author` (ObjectId)
- `voterIds` (Array of ObjectIds)
- `voteCount`, `commentCount`
- Timestamps
- Indexes: `author`, `status`, `category`, `createdAt`, `voteCount`, `commentCount`. Text index on `title` and `descriptionMarkdown`.

### Comment Schema
- `featureRequest` (ObjectId), `author` (ObjectId), `bodyMarkdown`
- `parentComment` (ObjectId | null)
- `isDeleted` (boolean - soft delete)
- Timestamps
- Indexes: `featureRequest`, `parentComment`, `author`, `createdAt`

## 4. API Route List

### Auth (`/api/v1/auth`)
- `POST /signup`, `POST /login`, `POST /logout`, `POST /refresh`
- `GET /me`, `GET /verify-email`, `POST /forgot-password`, `POST /reset-password`

### Features (`/api/v1/features`)
- `GET /` (with pagination, sort, category, status, search)
- `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
- **Votes:** `POST /:id/vote`, `DELETE /:id/vote`
- **Comments:** `GET /:id/comments`, `POST /:id/comments`

### Comments (`/api/v1/comments`)
- `PATCH /:id`, `DELETE /:id`

### Admin (`/api/v1/admin`)
- `GET /features`, `PATCH /features/:id/status`
- `GET /comments`, `DELETE /comments/:id`
- `GET /users`, `PATCH /users/:id/role` (optional)

## 5. Implementation Phases

- **Phase 1:** Project setup (folders, TS, Vite, Express, DB connection, CORS).
- **Phase 2:** Database models (User, FeatureRequest, Comment, indexes).
- **Phase 3:** Authentication backend (JWT dual-token, endpoints, middleware).
- **Phase 4:** Feature backend (CRUD, pagination, text search).
- **Phase 5:** Voting backend (atomic operations, prevention of dupes).
- **Phase 6:** Comments backend (threaded support, soft deletes).
- **Phase 7:** Frontend foundation (Router, React Query, UI tokens, Tailwind).
- **Phase 8:** Main feature feed (feed UI, sorting/filtering, submit modal).
- **Phase 9:** Detail and comments (markdown, upvoting UI, comment threads).
- **Phase 10:** Roadmap (public 3-column kanban board).
- **Phase 11:** Admin (status management, comment moderation).
- **Phase 12:** Final polish (UX states, validation, documentation).

## User Review Required

> [!IMPORTANT]
> Please review the detailed folder structure, dependency list, database schema, API routes, and implementation phases above. If this aligns perfectly with your requirements, approve this plan so we can begin executing **Phase 1 — Project setup**.
