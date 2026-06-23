# Rules — Leave Management Backend

## Architecture Rules
- ALWAYS separate concerns: controllers handle HTTP, services handle business logic
- NEVER put business logic inside a controller
- NEVER write raw MongoDB queries — use Mongoose model methods only
- ALWAYS use dependency injection — never instantiate services manually
- ALWAYS register every module, service, controller, and schema in its module file

## File & Folder Rules
- Root app files go inside `app/`; do not keep controllers, services, or modules directly in `src/`
- Environment configuration goes inside `config/`
- Shared constants, enums, interfaces, and helpers go inside `common/`
- Feature-specific interfaces go inside that feature's `interfaces/` folder
- Feature-specific enums go inside that feature's `enums/` folder
- Feature-specific DTOs go inside that feature's `dto/` folder
- Feature-specific schemas go inside that feature's `schemas/` folder
- One module per feature: `auth/`, `users/`, `leave/`
- DTOs go inside `dto/` folder within the module
- Schemas go inside `schemas/` folder within the module
- Seed scripts go inside `src/seed/`
- All tests go inside the root `test/` folder, with subfolders matching `src/` modules
- Never put `*.spec.ts` or `*.e2e-spec.ts` files inside `src/`
- Runtime application code must stay inside `src/`

## Naming Conventions
- Files: `kebab-case.type.ts` (e.g. `leave-request.schema.ts`, `create-leave.dto.ts`)
- Classes: PascalCase (e.g. `LeaveService`, `CreateLeaveDto`)
- Methods: camelCase (e.g. `findAll`, `updateStatus`)
- Constants and enums: UPPER_SNAKE_CASE (e.g. `PENDING`, `APPROVED`)
- Module names in decorators: match the class name exactly

## TypeScript Rules
- NEVER use `any` type — always define proper interfaces or use Mongoose document types
- ALWAYS type function return values explicitly
- ALWAYS add concise JSDoc to exported controllers, services, modules, shared interfaces, config objects, and reusable helpers
- Use inline comments only when they explain non-obvious infrastructure behavior or business rules
- Use `async/await` only — no `.then()` chains
- Import types with `import type` where applicable

## DTO Rules
- ALWAYS use `class-validator` decorators on every DTO field
- ALWAYS use `ValidationPipe` globally (already set in main.ts)
- Use `@IsEnum()` for status and type fields
- Use `@IsDateString()` for date fields
- Use `@IsOptional()` for optional fields

## Guard Rules
- EVERY protected route MUST have `@UseGuards(JwtAuthGuard)` and `@UseGuards(RolesGuard)` where role is required
- NEVER expose admin endpoints without `@Roles('ADMIN')`
- NEVER expose employee endpoints without `@Roles('EMPLOYEE')`
- `/auth/register` and `/auth/login` are the ONLY public endpoints
- JWT strategy and auth guards live inside `auth/strategies/` and `auth/guards/`
- Refresh token strategy and guard live beside access-token auth and must use centralized refresh-token config
- Role metadata lives in `auth/decorators/`

## Response Rules
- ALWAYS return responses in this format:
  ```ts
  { success: true, data: <payload>, message: string }
  ```
- ALWAYS use shared response helpers and centralized message constants
- NEVER hardcode reusable response messages in controllers or services
- NEVER return the password field in any response — always exclude it
- NEVER select password hashes except in credential verification paths
- Use appropriate HTTP status codes: 200 (GET), 201 (POST), 400 (bad input), 401 (unauth), 404 (not found)

## Business Logic Rules
- NEVER approve or reject a leave that is not in PENDING status
- ALWAYS deduct leaveBalance when status changes to APPROVED
- NEVER deduct leaveBalance on REJECTED
- ALWAYS calculate `days` on the backend — never trust the client value
- ALWAYS validate `days <= leaveBalance` before creating a leave request
- `days = endDate - startDate + 1` (calendar days, inclusive)
- Employee leave endpoints must be guarded with `JwtAuthGuard`, `RolesGuard`, and `@Roles(UserRole.EMPLOYEE)`
- Admin leave endpoints must be guarded with `JwtAuthGuard`, `RolesGuard`, and `@Roles(UserRole.ADMIN)`
- Creating a leave request must not deduct balance; only approval deducts balance
- Admin list endpoints may filter by leave `status` and leave `type`
- Employee and admin leave list endpoints must use pagination and cap `limit` at 100
- Admin stats must count total requests by status and total employee users from the users module
- Employees may edit or delete only their own `PENDING` leave requests
- Employee edits must recalculate inclusive days and revalidate current shared leave balance

## Error Handling Rules
- Use NestJS built-in exceptions ONLY:
  - `NotFoundException` — resource not found
  - `BadRequestException` — validation failed or business rule violated
  - `UnauthorizedException` — invalid credentials or missing token
  - `ForbiddenException` — authenticated but wrong role
- NEVER throw raw `Error` objects
- NEVER swallow errors with empty catch blocks

## Mongoose Rules
- ALWAYS use `{ timestamps: true }` on all schemas
- ALWAYS use `@Prop({ required: true })` for required fields
- Use `populate()` for `employeeId` in leave queries
- NEVER use `findOneAndUpdate` without `{ new: true }` option

## CORS & Config Rules
- NEVER read `process.env` outside `src/config/`
- NEVER hardcode URLs, ports, secrets, event names, response messages, or reusable business constants in feature code
- CORS origin must come from centralized config in production
- PORT must come from centralized config

## What NOT To Do
- Do NOT create a registration endpoint for admin
- Do NOT skip validation on any endpoint
- Do NOT return passwords in any response ever
- Do NOT use `@nestjs/config` unless already set up — centralize direct `process.env` reads in `src/config/`
- Do NOT add any packages without confirming they are needed
- Do NOT generate migrations — this project uses Mongoose, not an ORM with migrations
