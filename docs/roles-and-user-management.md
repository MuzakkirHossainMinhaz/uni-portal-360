# Roles and User Management

The application supports exactly four roles: **Super Admin, Admin, Faculty and Student**. Admin, Faculty and Student cover everyday university workflows; Super Admin is the system-owner account within administration.

## Role responsibilities

| Role | Purpose and current behavior | Portal / management |
| --- | --- | --- |
| Super Admin (`superAdmin`) | Bootstrap system owner. Shares the Admin portal, can edit/delete Admin profiles and bypasses permission checks. Explicit API role lists and service checks still apply. | `/admin/dashboard`; visible in All Accounts & Roles even without an Admin profile. |
| Admin (`admin`) | Manages student/faculty records, academics, courses, offerings, semester registration, fees, reports, analytics and audit logs. Can create Admins; editing/deleting Admin profiles requires Super Admin. | `/admin/dashboard`; User Management → Admins. |
| Faculty (`faculty`) | Teaching: assigned courses/enrollments, assignments, submission grading and course marks. Attendance APIs exist, but the current Faculty Attendance screen uses mock students and a success message. | `/faculty/dashboard`; User Management → Faculty. |
| Student (`student`) | Enrollment, schedule, assignment submission, results, attendance, fees and transcript access. The fee workflow records transaction IDs; it does not establish an external gateway payment. | `/student/dashboard`; User Management → Students. |

An Admin/Faculty designation is descriptive profile data, not an authorization role. Academic Faculty means an organizational unit, not a Faculty user (teacher). No additional staff roles are required.

## User Management

Admins, Faculty and Students are lists of profile documents. Login identity and authorization role live in the User collection. The seeded Super Admin has a User document without an Admin profile, so it appears in **All Accounts & Roles** rather than the Admin profile list.

All Accounts & Roles provides role descriptions and counts, ID/email search, role filtering, pagination and optional inclusion of soft-deleted accounts. Profile links open the existing management pages. Super Admin remains read-only here; there is no role promotion or permission editing.

Only Admin and Super Admin can access `GET /api/v1/users` and `GET /api/v1/users/roles`. Account responses use an explicit field allowlist and never include password hashes. Role counts include deleted accounts; clicking a count includes those accounts in the results. Unexpected stored role names are marked unsupported for diagnosis, not activated.

## Current access matrix

This records route/service behavior, not just seeded permission names. Read access does not imply that a corresponding screen exists.

| Function | Admin | Super Admin | Faculty | Student |
| --- | --- | --- | --- | --- |
| All-account directory / role guide | Read | Read | No | No |
| Student/Faculty profile management | Manage | Manage | Some Student/Faculty read APIs | No management |
| Admin profiles | Create/read | Create/read/edit/delete | No | No |
| Academics, courses and registration | Manage | Manage | Read | Read |
| Offered courses | Manage | Manage | Read; creation route also allows role | Read/enroll |
| Enrollment | No self-enrollment | No self-enrollment | View assigned enrollments | Enroll/view own |
| Assignments | Read APIs | Omitted from current route allowlists | Create/read/update/delete | Read/submit |
| Submission listing/grading | List | Omitted from current route allowlists | List/grade | Submit/update |
| Course marks | Route allows; service needs Faculty identity | Same limitation | Update assigned enrollment marks | View grades |
| Attendance | Reports/analytics | Reports/analytics | Record API; UI incomplete | Own attendance |
| Fees | Create/list | Create/list | List API | Own fees/payment workflow |
| Results/transcripts | Transcript route allows; service uses caller's student ID | Same limitation | No semester-results endpoint | Own results/transcript |
| Analytics / audit logs | Read | Read | No | No |
| Notifications / password change | Yes | Yes | Yes | Yes |

## Permissions and existing limitations

`auth(...)` checks the token role against a route's allowlist. Some routes additionally call `checkPermission(...)`, notably Course and selected user-creation routes. Super Admin's permission bypass does not override a route that omits Super Admin.

The four retained roles keep their existing permissions and route restrictions. Shared academic permission definitions remain in place. The User schema and RBAC seed derive roles from `USER_ROLE`, with typed permission mappings, so adding a database role name cannot create an account type or portal.

Existing implementation gaps are documented rather than presented as working features:

- Faculty Attendance currently uses mock data and does not save attendance from its UI.
- The seeded Super Admin has no Admin profile, so `/users/me` can return permissions without profile details. The seed also uses `status: 'active'` although the schema accepts `in-progress` or `blocked`; this existing bootstrap issue needs correction before a fresh deployment.
- Admin/Super Admin pass the course-mark route but its service resolves the caller as Faculty. Transcript generation likewise looks up the caller as Student. These are not completed administrative override workflows.
- `withdrawCourse` and `publishResult` remain permission names without corresponding withdrawal/publication routes. GPA is calculated through the marks workflow.
- Admin management displays edit/delete controls to ordinary Admins, while the backend requires Super Admin.
- The offered-course creation route allows Faculty, but its sidebar has no offering-management screen.

## Database cleanup

Member and Registrar functionality has been removed: routes, profiles, creation flow, ID generation, frontend page/navigation/API hooks and Member-only permission seeds.

The one-time [cleanup script](../backend/scripts/remove-retired-roles.cjs) reads the backend's configured DATABASE_URL without printing credentials. From the backend directory:

```powershell
node scripts/remove-retired-roles.cjs          # Read-only inventory
node scripts/remove-retired-roles.cjs --apply  # Apply removal
```

It deletes the two retired role/account types, obsolete profile records, linked notifications, four Member-only permissions and associated role-permission mappings. Shared academic permissions and existing audit history are preserved. It aborts if retired profiles/accounts conflict with retained core profiles and verifies retained accounts, profiles, roles and permissions inside a transaction. It is safe to rerun and does not run automatically at startup.

Deletion is permanent without a database backup; source-code removals remain recoverable through Git. The migration script is maintenance history, not a supported feature.

Applied to the configured `uni-portal-360` database: removed 2 retired roles, 4 Member-only permissions and 26 mappings. There were no retired-role accounts or profiles. Readback confirmed only `admin`, `faculty`, `student` and `superAdmin` roles remain; retained data was unchanged.

## Code references

- [Supported role constants](../backend/src/modules/User/user.constant.ts) and [User schema](../backend/src/modules/User/user.model.ts).
- [Role descriptions](../backend/src/modules/User/user.roles.ts) and [account directory](../backend/src/modules/User/user.directory.ts).
- [RBAC permissions](../backend/src/modules/RBAC/rbac.service.ts), [role guard](../backend/src/middlewares/auth.ts) and [permission guard](../backend/src/middlewares/checkPermission.ts).
- [Profile creation and self lookup](../backend/src/modules/User/user.service.ts); [bootstrap owner](../backend/src/config/db.ts).
- [Admin navigation](../frontend/src/routes/admin.routes.tsx), [Faculty navigation](../frontend/src/routes/faculty.routes.tsx), [Student navigation](../frontend/src/routes/student.routes.tsx).
