# Code conventions

These conventions apply to the backend and frontend. Follow the nearest module's domain structure and reuse the shared utilities below.

## Formatting and checks

- The root `.prettierrc.json` owns formatting for both applications: two spaces, single quotes, semicolons, 120 columns, and LF line endings. `.editorconfig` applies the same editor defaults.
- `eslint.rules.mjs` owns common TypeScript rules. Use `import type` for types, handle errors as `unknown`, and use each app's logger instead of `console`. Unused names are errors; prefix deliberately unused parameters with `_`.
- Run `npm run format` to format both source trees. Run `npm run check` at the repository root for formatting, lint, builds, and unit tests. Install each app's dependencies first. Frontend helper tests use Node's native TypeScript support; use Node 24 LTS.
- Run `npm run test:smoke` with a local MongoDB replica set for HTTP and database regression coverage. The script creates and drops its own isolated database.

## Backend modules

- Keep domain modules under `backend/src/modules/<Domain>`. Use lower camel case filenames with a role suffix, such as `offeredCourse.service.ts`, `offeredCourse.controller.ts`, and `offeredCourse.validation.ts`.
- Export module facades as `<Domain>Services`, `<Domain>Controllers`, `<Domain>Validations`, and `<Domain>Routes`. Service methods describe the operation (`createCourse`, `getAllCourses`, `updateCourse`); omit database suffixes.
- Routes compose authentication, authorization, validation, and controller handlers. Access schemas through the module's validation facade.
- Controllers read request inputs, call a service, and use `sendResponse`. Wrap asynchronous handlers with `catchAsync`; read scalar route identifiers with `getRouteParam`.
- Services own business rules, ownership checks, and transaction boundaries. Reuse repositories for shared CRUD operations. Keep transaction-specific queries in the service when they need a common session; do not add forwarding classes merely to make every module have the same number of files.
- Paginated services return `{ data, meta }`. Use `getPagination`, `getPaginationMeta`, and `QueryBuilder`; pagination metadata is defined once in `utils/pagination.ts`.
- Throw `AppError` for expected failures and let centralized middleware serialize errors. Keep success messages concise and consistent. Comments should explain constraints or business decisions rather than narrating each line.

## Frontend modules

- Keep pages under their existing role and feature directories. Use PascalCase for React component files and `<feature>.api.ts` for RTK Query endpoint modules.
- Use the shared `baseApi` for network operations and cache invalidation. Keep endpoint definitions and server-response adaptation out of pages.
- `TResponse<T>` describes the server envelope; it does not contain Redux runtime methods. Paginated hooks return `TPaginatedResponse<T>` through `toPage`.
- Use `toQueryParams` for array or object filters. It preserves repeated keys, `false`, and `0`, omits empty filters, and encodes values with `URLSearchParams`.
- Declare mutation outputs to match the returned value. An untransformed response remains a `TResponse<T>` envelope; use `TResponse<unknown>` when callers only need success or failure. Only declare an entity return type when `transformResponse` actually unwraps it.
- Reuse shared forms and components, await mutations with `.unwrap()`, and provide loading, error, and empty states. Use the existing design system for feature work.
- Keep role pages lazy loaded and load large optional exports, such as PDF receipts, on demand.

## Refactoring and verification

- Preserve public routes, role permissions, and business behavior during consistency refactors. Add focused tests for changed shared boundaries rather than tests that merely reproduce implementation details.
- Keep formatting and mechanical naming changes distinct from new features when preparing commits. On Windows, record case-only renames with Git so Linux checkouts receive the matching filenames.
- Build and test both apps after changing shared types or imports. The automated checks establish compilation and tested behavior; browser interactions and external integrations need their own verification.
