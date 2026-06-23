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
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### Seed Admin User

```bash
pnpm run seed:admin
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
pnpm run start
```

API will be available at `http://localhost:5000/api`

### Render Deployment

Use these commands on Render:

```bash
# Build Command
pnpm install --frozen-lockfile; pnpm run build

# Start Command
pnpm run start
```

`pnpm run start` runs `node dist/main` and expects `pnpm run build` to have already created the `dist/` folder. Do not use `nest start` as the Render start command because it invokes the Nest CLI at runtime and can exceed memory on small instances.

The package pins Node to `20.x` through `package.json` so Render does not deploy with its default Node version.

---

## Architecture

```
src/
├── app/            → Root app module, health controller, app service
├── config/         → Centralized environment/config mapping
├── common/         → Shared constants, enums, interfaces, response helpers
├── auth/           → JWT auth, DTOs, guards, strategy, register/login/me
├── users/          → User schema, users service, user interfaces
├── leave/          → Employee leave creation/history and admin review flow
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
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, and `JWT_REFRESH_EXPIRES_IN` are read through `src/config/app.config.ts`.
- Login/register/refresh responses return `{ token, refreshToken, user }`; password hashes are never selected for normal user reads or returned by API responses.
- `/api/auth/me` validates the bearer token and returns the current user profile.
- `/api/auth/refresh` is protected by a refresh-token guard and rotates the token pair.
- `/api/auth/logout` validates the access token before the frontend clears local auth state.

### Auth Module Structure
```
src/auth/
├── constants/      → Auth messages, JWT strategy name, password hashing cost
├── decorators/     → Role metadata decorator
├── dto/            → Login and registration DTOs
├── guards/         → JWT and role guards
├── interfaces/     → Auth response, JWT payload, request user contracts
├── strategies/     → Passport JWT strategy
├── auth.controller.ts
├── auth.module.ts
└── auth.service.ts
```

### Users Module Structure
```
src/users/
├── constants/      → User defaults such as leave balance
├── interfaces/     → User creation and safe response contracts
├── schemas/        → Mongoose user schema
├── users.module.ts
└── users.service.ts
```

### Leave Lifecycle
```
PENDING → APPROVED (balance deducted)
PENDING → REJECTED (no balance change)
```

### Employee Leave Flow
- `POST /api/leave` creates a `PENDING` request for the authenticated employee.
- `GET /api/leave/my` returns only the authenticated employee's leave requests.
- `GET /api/leave/balance` returns the authenticated employee's current shared leave balance.
- The backend calculates inclusive calendar days and validates `endDate >= startDate`, reason length, and requested days against current balance.
- Leave balance is not deducted when a request is created; deduction happens only when an admin approves a pending request.

### Admin Leave Flow
- `GET /api/leave/all` returns all leave requests for admins and supports optional `status` and `type` filters.
- `GET /api/leave/stats` returns total request counts by status plus the employee count for the admin dashboard.
- `PATCH /api/leave/:id/status` accepts `APPROVED` or `REJECTED` with an optional admin comment.
- Only `PENDING` requests can be actioned. Approved requests deduct the employee balance immediately; rejected requests do not change balance.
- Admin list responses include the employee summary when the employee record is available.

### Employee Leave Edits
- `PATCH /api/leave/:id` lets employees edit their own `PENDING` requests only.
- `DELETE /api/leave/:id` lets employees delete their own `PENDING` requests only.
- Employee edits recalculate inclusive days and revalidate the current shared balance.
- Approved or rejected requests cannot be edited or deleted by employees.

### API Endpoints

**Auth**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

**Employee**
```
POST   /api/leave
GET    /api/leave/my
GET    /api/leave/balance
PATCH  /api/leave/:id
DELETE /api/leave/:id
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
