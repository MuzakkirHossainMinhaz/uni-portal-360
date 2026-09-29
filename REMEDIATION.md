# Production-readiness remediation status

This tracks the 30 findings in the 28 September 2026 project review. “Code fixed” means the reported source defect has a code change and local verification; it does **not** certify a live deployment. The release gates below must be completed before using real student, grade or financial records.

| Finding | Status | What changed or remains |
| --- | --- | --- |
| R01 Bootstrap credential | Code fixed; existing-data gate | New installations require a unique bootstrap secret and first-login replacement. Rotate any existing account created with the old published password. |
| R02 Password policy | Improved; onboarding gate | All creation/change/reset paths enforce a 12–128 character nonblank password; shared fallback removed. Institution-issued temporary credentials still need a controlled, expiring distribution process. |
| R03 Private populated profiles | Code fixed | Enrollment, roster and course faculty responses use minimized projections; faculty directory access is restricted. |
| R04 Faculty access to all fees | Code fixed | Global fee listing is Admin-only. |
| R05 Premature grade publication | Code fixed | Marks are saved as drafts until explicit publication with all components present. |
| R06 Published grade mutation | Code fixed | Faculty cannot overwrite published results or assignment grades. Admin corrections require a reason and retain before/after history. |
| R07 Historical course credits | Code fixed; existing-data gate | Enrollment snapshots preserve course identity/credits and catalog identity is immutable after enrollment. Reconcile existing historical records before release. |
| R08 Registration window | Code fixed | Enrollment and offered-course discovery enforce the configured date window. |
| R09 Faculty archival | Code fixed | Active teaching must be transferred with a reason before archival; enrollment and assignment ownership move transactionally. |
| R10 Simulated payment | Contained; integration gate | Simulation is allowed only in explicit development/test environments. Production and unknown environments return 503; a verified provider is still needed for online payment. |
| R11 Dependency advisories | Code fixed at audit date | Both clean lockfile installs and npm audits report zero known advisories. Continue periodic scanning. |
| R12 Audit integrity | Improved; release gate | Result, assignment-grade and fee changes now write before/after audit records in their transactions. Generic request auditing remains asynchronous and other sensitive operations need a broader durable-audit design. |
| R13 Campus rate limiting | Improved; deployment gate | Removed the broad per-IP limiter, scoped login attempts by IP and user ID, and made trusted proxy hops explicit. Use a shared rate-limit store for multiple API instances. |
| R14 Startup and health | Code fixed; deployment gate | Production config validation, readiness health endpoint, startup failure handling and graceful shutdown are in place. Verify them in the actual hosting environment. |
| R15 Admission semester update | Code fixed | Student updates reject nonexistent semesters. |
| R16 Academic semester uniqueness | Code fixed | Update validation and a database unique index enforce year/name uniqueness. Migrate preexisting duplicates before index creation. |
| R17 Prerequisite cycles | Code fixed | Course edits reject cyclic prerequisites. |
| R18 Attendance dates | Code fixed | Future/invalid dates and ended-semester changes are rejected. |
| R19 Admin middle name | Code fixed | An empty optional middle name can be edited. |
| R20 Password-change token timing | Code fixed | Session versioning replaces the same-second timestamp check; a concurrent stale password change is rejected. |
| R21 Refresh/logout lifecycle | Code fixed | Refresh checks session version; frontend retries after refresh; logout revokes access and refresh tokens. |
| R22 Recovery and fallback routes | Code fixed | Password reset, profile and route fallback screens are implemented; recovery page was browser spot-checked. |
| R23 Submission feedback | Code fixed | Students can view grades/feedback and replace an ungraded submission before deadline; faculty can maintain assignments. |
| R24 Selectors capped at 100 | Code fixed for reviewed admin forms | Paginated option endpoints replace fixed 100-record selector requests. Verify large production datasets in staging. |
| R25 Notifications | Improved; deployment gate | Full inbox and transaction-bound grade, assignment and fee notifications are implemented. Verify provider delivery and monitoring in staging. |
| R26 Transcript ordering/IDs | Code fixed | Semester ordering and full course identifiers use enrollment snapshots. Validate long and multilingual PDFs with actual institutional data. |
| R27 Private uploads | Code fixed for new uploads; existing-data gate | New submissions use authenticated Cloudinary assets and short-lived authorized links; profile photos are type-checked. Migrate or revoke already-public submission URLs and test real Cloudinary access. |
| R28 Cross-record races | Improved; load-test gate | Offered-section uniqueness and faculty timetable writes have database constraints/transactional locking; enrollment and grading use transactions. Stress-test other combinations with realistic load. |
| R29 UI contracts and recovery | Improved; browser gate | Navigation, selector pagination, submission pages, recovery, link contrast and React Hooks checks were improved. Full role-by-role responsive and accessibility testing remains. |
| R30 Release evidence | Improved; deployment gate | CI, production build config, clean installs, unit tests and 98 disposable-database API assertions are present. The new CI workflow and external integrations still need staging execution. |

See [PRODUCTION.md](PRODUCTION.md) for the deployment checklist. No payment provider is configured, so real online fee settlement remains deliberately unavailable.
