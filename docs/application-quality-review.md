# Application quality review

Reviewed: 27 September 2026

## Outcome and evidence

This pass reviewed routes, API contracts, data access, shared infrastructure and frontend integration across the existing modules. Concrete defects were fixed in the working tree. This is an engineering review with automated verification, not a guarantee that every possible browser interaction or deployment configuration has been tested.

| Check | Result |
| --- | --- |
| Backend TypeScript build | Passed |
| Frontend TypeScript and Vite production build | Passed |
| Backend ESLint | Passed, no lint warnings |
| Frontend ESLint with zero-warning gate | Passed |
| Jest | 68 tests passed across 14 suites |
| Frontend API helper tests | 5 tests passed |
| Shared formatting checks | Passed for both source trees |
| Root `npm run check` | Passed |
| Relative import filename casing | Passed across 285 TypeScript source files |
| HTTP API smoke tests with real local MongoDB | 57 assertions passed |
| Git whitespace/error check | Passed |
| Visual browser interactions | Not verified: browser access was denied during this session |
| SMTP/Ethereal delivery and Cloudinary upload | Not exercised against external services |

The smoke test creates a random `uni_portal_quality_<UUID>` database on the configured local MongoDB server. It checks the exact database name before cleanup and removes only that test database. It refuses remote database URLs. Existing application records are not used for the smoke test.

## Changes by area

### Shared code and maintainability

- Added bounded pagination shared by query building, fees, audit logs and notifications.
- Preserved server ownership filters when client query filters are added; escaped search metacharacters and skipped invalid empty-field searches.
- Applied parsed request bodies so Zod defaults, transforms and unknown-field stripping actually reach services.
- Added update validators and consistent missing-record errors to shared repository/service operations.
- Added focused helpers for academic profile resolution, faculty course ownership, parent-record references and multipart parsing.
- Reused the gradebook for the course roster instead of maintaining two grading forms.
- Replaced `any` in the shared form and JWT utility with typed interfaces. Corrected the populated enrollment and attendance API types.
- Reset RTK Query state when the account changes or logs out.
- Kept business rules in domain services and HTTP formatting in controllers. Reused existing repository contracts rather than adding a new framework or forcing every service into inheritance.

### Academic setup, courses and enrollment

- Prevented deletion of faculties, departments and semesters referenced by current or historical records.
- Checked department parent-faculty existence and blocked reassignment when dependent records would become inconsistent.
- Scoped faculty offered-course queries to their assigned sections.
- Removed the Redux endpoint-name collision between student and administrator offered courses.
- Made enrollment and capacity reservation transactional. Concurrent requests for the last seat are tested.
- Enforced registration status, department eligibility, credit limits, passed prerequisites, duplicate-course prevention and schedule conflicts.
- Corrected schedule comparisons to check shared weekdays.
- Added pagination and failure feedback to the student course list and schedule.

### Attendance, grading, assignments and results

- Replaced the faculty attendance mock roster and fake save action with a real roster, saved daily statuses, remarks and bulk-present action.
- Resolved custom login IDs to student/faculty database records and populated student attendance course titles.
- Validated attendance dates, IDs, statuses and duplicate students.
- Connected the existing administrator attendance screen and replaced its placeholder tab with real counts and low-attendance records. Late attendance counts as participation.
- Made marks, semester GPA and student CGPA update in one transaction. A deliberately forced GPA failure verifies marks rollback.
- Fixed zero final marks and zero-grade-point results.
- Scoped assignment and submission reads/writes to enrolled students and the responsible faculty. Enforced grade bounds and submission edit restrictions.
- Corrected assignment response nesting, deadline field names and file selection. Added pagination to assignment lists and the faculty gradebook.
- Batched assignment notifications and kept notification delivery failure from changing a committed write into an API failure.
- Corrected student result lookup and transcript API URL/authentication. Transcript PDF generation is covered by the smoke test.
- Replaced the student/faculty dashboard placeholders with live queries.

### Fees, system and authentication

- Completed fee create/edit/void/filter/pagination and student payment-summary flows from the preceding work.
- Kept paid fees immutable and enforced payment ownership and duplicate-payment prevention. Payments and receipts are explicitly labeled simulations.
- Recorded authenticated mutations in audit logs and added filter support; request bodies and query strings are not copied into audit entries.
- Corrected administrator faculty counts and labeled the registration chart according to the records it measures.
- Corrected reset-password request validation, separated reset tokens from session tokens and made reset links single-use.
- Corrected development refresh-cookie settings and production SMTP TLS-port handling.
- Centralized multipart parsing, added a 10 MB upload limit, cleaned temporary uploads and enabled document resource types for Cloudinary.
- Renamed the backend ESLint configuration to match its ES-module syntax and quieted dotenv startup output.

## Frontend loading

Role pages now load on demand. PDF receipt code loads when the user requests a receipt. The main application JavaScript chunk decreased from approximately 2,072 KB to 81 KB minified; this is the application chunk, not the total page transfer size. Ant Design (approximately 1,214 KB) and the PDF renderer (approximately 1,573 KB, loaded on demand) still trigger Vite's large-chunk warning.

## Reproduce the checks

From `backend`:

```powershell
npm run lint
npm run build
npm test -- --runInBand
npm run test:smoke
```

The smoke test requires the configured local MongoDB server to support transactions, normally through a replica set. It starts its own HTTP listener on a free local port. Expected rejected requests and the deliberate rollback failure appear in its logs; its exit status and assertion summary determine success. It does not send emails or upload documents to Cloudinary.

From `frontend`:

```powershell
npm run lint
npm run build
```

## Remaining verification limits

- Browser rendering, responsive layouts, keyboard interactions and actual receipt downloads need an authorized browser session. No browser test pass is claimed.
- External upload/email delivery needs configured services and an explicit delivery test. Local request validation and malformed multipart handling are covered.
- The smoke test samples the principal role-based workflows and failure cases. It is not an exhaustive test of every CRUD permutation or every simultaneous operation.
- Payment processing remains simulated; no real payment gateway was added.
- The application retains its existing dollar currency display; no currency conversion was introduced.

## Code consistency follow-up

Completed on 27 September 2026:

- Centralized formatter settings and TypeScript lint rules, including type-only imports, no explicit `any`, and logger-based output.
- Normalized backend module facades, service operation names, validation imports, frontend API filenames, and misspelled filenames. Case-only renames were recorded in Git so they survive a Linux checkout.
- Unified paginated service results as `{ data, meta }` and shared backend pagination metadata types.
- Replaced repeated frontend query serialization and list transforms with `toQueryParams` and `toPage`.
- Corrected server response types: removed the Redux runtime intersection and declared untransformed mutation responses as envelopes.
- Centralized scalar route parameter extraction and rejection of missing, empty, or array parameters.
- Applied formatting to both source trees, removed redundant tutorial comments, and simplified the generated backend TypeScript configuration without changing its compiler options.
- Added [code conventions](code-conventions.md) and a root `npm run check` command. The checks above and all 57 database-backed HTTP assertions passed after the refactor. Both local development servers returned HTTP 200.

The case-only renames are staged; the implementation edits remain in the working tree. No commit or push was made.
