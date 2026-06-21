# Leave Management System — Backend

A NestJS REST API for managing employee leave requests with role-based access control.

---

## Overview

This is the backend service for the Leave Management System built as part of the Nrolled IT Team Selection Assignment. It handles authentication, leave request lifecycle, and admin operations via a RESTful API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| Database | MongoDB (Mongoose) |
| Auth | JWT + Passport.js + bcryptjs |
| Validation | class-validator, class-transformer |
| Package Manager | pnpm |
| Deployment | Render |

---

## Setup

### Prerequisites
- Node.js >= 18
- pnpm
- MongoDB running locally or Atlas URI

### Installation

```bash
git clone https://github.com/<your-username>/leave-management-backend.git
cd leave-management-backend
pnpm install
```

### Environment Variables

Create a `.env` file in the root:

```env
MONGODB_URI=mongodb://localhost:27017/leave-management
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### Seed Admin User

```bash
npx ts-node src/seed/seed.ts
```

This creates the default admin account:
- Email: `admin@nrolled.com`
- Password: `Admin@123`

### Run

```bash
# development
pnpm run start:dev

# production
pnpm run build
pnpm run start:prod
```

API will be available at `http://localhost:5000/api`

---

## Architecture

```
src/
├── app/            → Root app module, health controller, app service
├── config/         → Centralized environment/config mapping
├── common/         → Shared constants, enums, interfaces, response helpers
├── auth/           → JWT auth, guards, register/login
├── users/          → User schema, users service
├── leave/          → Leave requests CRUD, approve/reject logic
└── seed/           → Admin seeder script
test/
├── app/            → App module unit/e2e tests
├── auth/           → Auth module tests
├── users/          → Users module tests
├── leave/          → Leave module tests
└── jest-e2e.json   → E2E Jest config
```

### Configuration & Constants
- `src/config/app.config.ts` is the only place that reads `process.env`.
- Shared response messages, event names, defaults, and enums live under `src/common/`.
- Controllers should use shared response helpers and centralized messages instead of hardcoded response strings.
- Feature work must update the relevant README, AGENTS, RULES, or PRD sections when behavior, structure, endpoints, env vars, or contracts change.

### Structure & Comments
- Runtime files must live in their owning directory, for example root app files live under `src/app/`.
- Structural code must live in typed folders: `dto/`, `enums/`, `interfaces/`, `schemas/`, `constants/`, and `utils/` as applicable.
- Exported controllers, services, modules, shared interfaces, config objects, and reusable helpers should include concise JSDoc.
- Use inline comments only for non-obvious infrastructure or business-rule decisions.

### Testing Structure
- All backend tests live under the root `test/` folder, never inside `src/`.
- Test subfolders mirror source modules, for example `src/auth/` pairs with `test/auth/`.
- Unit specs use `*.spec.ts`; e2e specs use `*.e2e-spec.ts`.
- `pnpm test` runs unit specs from `test/`; `pnpm test:e2e` uses `test/jest-e2e.json`.

### Auth Flow
- Employee self-registers → receives JWT
- Admin is pre-seeded in DB (no registration endpoint)
- All protected routes use `JwtAuthGuard` + `RolesGuard`

### Leave Lifecycle
```
PENDING → APPROVED (balance deducted)
PENDING → REJECTED (no balance change)
```

### API Endpoints

**Auth**
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

**Employee**
```
POST   /api/leave
GET    /api/leave/my
GET    /api/leave/balance
```

**Admin**
```
GET    /api/leave/all
PATCH  /api/leave/:id/status
GET    /api/leave/stats
```

---

## AI Usage

This project was built with assistance from **Claude (Anthropic)** and **Codex**:

- **Architecture design** — Claude helped define the module structure, DB schema, and API contract
- **Code generation** — Codex used to scaffold NestJS modules, DTOs, guards, and service logic
- **Business logic review** — Claude reviewed leave balance deduction logic and edge cases
- **README and documentation** — Claude assisted in writing structured documentation

All AI-generated code was reviewed, tested, and adjusted manually.

---

## Assumptions

- Admin account is pre-seeded; there is no admin registration endpoint
- Leave balance defaults to **12 days** per employee, shared across all leave types (SICK, CASUAL, EARNED)
- Days are calculated as calendar days inclusive (`endDate - startDate + 1`), with no weekend or holiday exclusions
- Only one status transition is allowed: `PENDING → APPROVED` or `PENDING → REJECTED`
- Approved leaves deduct from balance immediately; rejected leaves make no change
- No email notifications — status changes are reflected in the UI only
