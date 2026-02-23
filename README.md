# Uni Portal 360 – Modern University Management Platform

Uni Portal 360 is a full‑stack university management application designed for real‑world academic workflows.  
It provides dedicated experiences for **students**, **faculty**, and **administrators**, covering everything from course/semester setup to enrollments, attendance, grading, fees, analytics, notifications, and audit logging.

The project is split into:

- `backend/` – REST API (Node.js, Express, MongoDB, TypeScript)
- `frontend/` – React SPA (Vite, TypeScript, Redux Toolkit, Ant Design)

---

## 1. Getting Started

### 1.1 Prerequisites

Make sure you have:

- **Node.js** ≥ 18
- **npm** (comes with Node)
- A running **MongoDB** instance or cloud connection string

Optional (for email and file uploads, if you want them fully functional):

- SMTP credentials (for password reset emails)
- Cloudinary account (for image uploads)

---

### 1.2 Clone the Repository

```bash
git clone <your-repo-url> uni-portal-360
cd uni-portal-360
```

Replace `<your-repo-url>` with your own repository URL.

---

### 1.3 Backend Setup (`backend/`)

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Create environment file**

   In `backend/`, create a `.env` file and configure at least:

   ```env
   NODE_ENV=development
   PORT=5000

   DATABASE_URL=mongodb://localhost:27017/uni-portal-360

   JWT_ACCESS_SECRET=your_access_secret
   JWT_ACCESS_EXPIRES_IN=1d
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_REFRESH_EXPIRES_IN=365d

   BCRYPT_SALT_ROUNDS=10

   RESET_PASS_UI_LINK=http://localhost:5173/reset-password

   # Optional integrations (email, cloud storage)
   SMTP_HOST=smtp.your-provider.com
   SMTP_PORT=587
   SMTP_USER=your_user
   SMTP_PASS=your_password

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

   The exact variable names may differ slightly from the above, but this matches how the backend reads configuration (via `backend/src/config`).

3. **Run the backend in development mode**

   ```bash
   npm run dev
   ```

   This will:
   - Connect to MongoDB
   - Seed a **super admin** user (via `seedSuperAdmin`)
   - Seed **RBAC roles and permissions**
   - Start the API at (for example) `http://localhost:5000/api/v1`
   - Serve API docs at `http://localhost:5000/docs`

4. **Production build (optional)**

   ```bash
   npm run build
   npm start
   ```

   This compiles TypeScript to `dist/` and runs `dist/server.js`.

---

### 1.4 Frontend Setup (`frontend/`)

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Run the frontend in development mode**

   ```bash
   npm run dev
   ```

   By default Vite runs on `http://localhost:5173`.

3. **Build the frontend (optional)**

   ```bash
   npm run build
   npm run preview
   ```

   `npm run preview` serves the production build locally.

---

## 2. Tech Stack

### 2.1 Backend

- **Runtime & Language**
  - Node.js
  - TypeScript

- **Web Framework**
  - Express 5

- **Database & ORM**
  - MongoDB
  - Mongoose

- **Auth & Security**
  - JWT (access & refresh tokens)
  - bcrypt password hashing
  - Role‑based access control (RBAC) with seeded roles/permissions
  - Helmet, CORS, HPP, express‑rate‑limit, express‑mongo‑sanitize, xss‑clean
  - Cookie‑based refresh token handling

- **Validation & Docs**
  - Zod for request validation
  - Swagger (swagger‑jsdoc + swagger‑ui‑express) for interactive API docs at `/docs`

- **Other**
  - Node‑cron for scheduled tasks (e.g. audit log cleanup)
  - Nodemailer for emails (password reset, etc.)
  - Cloudinary & PDF tooling for document/receipt generation
  - Jest for unit testing

### 2.2 Frontend

- **Core**
  - React (with Vite)
  - TypeScript

- **State & Data**
  - Redux Toolkit
  - RTK Query for API data fetching & caching
  - Redux Persist for auth token & user persistence

- **UI & UX**
  - Ant Design (components, layout, theme)
  - Custom theme provider (light/dark/system modes)
  - Recharts for analytics charts
  - React Hook Form + Zod for forms & validation
  - Sonner for toast notifications
  - Moment/Day.js for date handling

---

## 3. High‑Level Features

Uni Portal 360 models a modern university’s core processes. Below is a high‑level summary of what the app does.

### 3.1 Authentication & RBAC

- **Login & Session**
  - Username/password login with JWT access token and secure refresh token cookies.
  - Password change and reset (including email‑based reset links).
  - Enforced `needsPasswordChange` flow on first login or reset.

- **Role‑Based Access Control**
  - System roles: `superAdmin`, `admin`, `faculty`, `student`, `registrar`.
  - Fine‑grained permissions (e.g. `createStudent`, `assignFaculties`, `enrollCourse`, `createAssignment`, `viewResult`, etc.).
  - RBAC seeding on startup ensures consistent permissions across environments.

### 3.2 Academic Structure & Course Management

- **Academic Semesters**
  - CRUD for academic semesters (name, year, start/end dates, credits constraints).
  - Admin UI to create and list semesters.

- **Academic Faculties & Departments**
  - Manage faculties and departments and link them to academic programs.
  - Used when assigning students, faculty, and courses.

- **Courses**
  - Create and manage courses (title, prefix, code, credits).
  - Support for prerequisite courses.
  - Mapping between courses and faculties (which faculty can teach which course).

- **Semester Registrations**
  - Define semester registration windows with:
    - Associated academic semester
    - Start & end dates
    - Min/max credits per student
  - Admin view for all registered semesters with status (`UPCOMING`, `ONGOING`, `ENDED`) and ability to update status.

### 3.3 Offered Courses & Student Enrollment

- **Offered Courses**
  - Create “offered course” instances for a specific semester registration, department, and faculty.
  - Configure:
    - Section
    - Days (schedule)
    - Start/end time
    - Capacity
  - Backend validation prevents schedule conflicts and invalid faculty/department mappings.

- **Student Enrollment**
  - Students see “My Offered Courses” filtered by current semester.
  - They can **enroll** or **withdraw** subject to:
    - Capacity
    - Prerequisite completion
    - Credit load constraints
  - Enrolled courses are tracked and feed into:
    - Schedules
    - Attendance
    - Grading & results

- **Schedules**
  - Students can see a “My Schedule” view based on enrolled courses, including:
    - Course titles
    - Sections
    - Days of the week

### 3.4 User Management

- **Admins**
  - Create and manage student, faculty, and admin users.
  - IDs are generated using dedicated utilities (e.g. student ID generation per semester).
  - Support for profile fields, contact info, academic department, etc.

- **Faculty**
  - Assigned to courses via course–faculty mapping and offered courses.
  - Views for:
    - Courses they teach
    - Students in each course
    - Gradebook and mark entry.

- **Students**
  - Assigned to academic departments and semesters.
  - Access to:
    - Courses and enrollment
    - Attendance records
    - Assignments & submissions
    - Fees and receipts
    - Results and transcripts.

### 3.5 Attendance Management

- **Faculty Attendance**
  - Faculty can mark attendance for each offered course and date.
  - Only students actually enrolled in the course can be marked present/absent/late.
  - Backend prevents duplicate attendance entries for the same student/course/date.

- **Student Attendance View**
  - Students see their own attendance records:
    - Total classes
    - Present percentage
    - Counts of absences and late marks
  - Tabular view of individual attendance entries.

- **Admin Attendance Analytics**
  - Admin dashboard for:
    - Total attendance records
    - Low attendance students (below a configurable threshold)
    - Analytics summary via dedicated `/attendance/admin/analytics` endpoint.

### 3.6 Assignments & Submissions

- **Assignments**
  - Faculty create assignments linked to offered courses.
  - Students see their assignments with due dates and submission options.

- **Submissions**
  - Students submit work (with file URLs stored in the backend).
  - Faculty have a submissions view to:
    - Review submissions
    - Grade and leave feedback
    - See submission timestamps.

### 3.7 Grading, Results & Transcripts

- **Enrolled Course Marks**
  - Per‑course marks: class tests, midterm, final, etc.
  - Automatic calculation of grade and grade points.
  - Faculty tools for updating course marks.

- **Semester Results**
  - Aggregation of enrolled course grades into:
    - Total credits
    - GPA
    - Completed courses list
  - Student UI for viewing semester results.

- **Transcripts**
  - Backend support for transcript data (all semesters and courses).
  - Can be combined with PDF tools for downloadable transcripts.

### 3.8 Fees & Receipts

- **Admin Fee Management**
  - Generate fee items for students per semester (amount, type, due date, status).
  - List and filter all fees.

- **Student Fee View**
  - Students can:
    - See all fee items (pending/overdue/paid)
    - Pay a fee (simulated payment via transaction ID)
    - View total pending dues summary.

- **PDF Receipt**
  - After payment, students can download a PDF receipt with:
    - Transaction ID & payment timestamp
    - Student details
    - Fee type and semester
    - Amount paid.

### 3.9 Notifications & Audit Logs

- **Notifications**
  - In‑app notifications for users (e.g. assignment updates, system events).
  - Features:
    - Notification bell in the main layout
    - Paginated notifications list
    - Unread count badge
    - Mark single notification as read
    - Mark all as read
    - Delete notifications

- **Audit Logs**
  - Backend keeps audit logs of important actions (who did what, when, from which IP/user‑agent).
  - Admins can fetch logs via dedicated routes.
  - Scheduled cleanup task to keep the log size manageable.

### 3.10 Analytics Dashboards

- **Admin Dashboard**
  - Metrics:
    - Total students
    - Total courses
    - Total faculty
    - Total enrollments
  - Enrollment trend chart (over time) using Recharts.

- **Attendance Analytics**
  - See counts and breakdowns of attendance.
  - Low attendance alerts per course/student.

---

## 4. Development Workflow

Here is a very brief developer workflow overview:

1. **Backend**
   - Develop endpoints under `backend/src/modules/*`.
   - Wire them into `backend/src/routes/index.ts`.
   - Expose them under `/api/v1/<module>` with appropriate RBAC and validation.

2. **Frontend**
   - Add RTK Query endpoints under `frontend/src/redux/features/*`.
   - Use them from React components in `frontend/src/pages/*` and `frontend/src/components/*`.
   - Use Ant Design & custom components (`PHForm`, `PHInput`, `PageHeader`, etc.) for UI.

3. **Quality**
   - Backend:
     - `npm run lint`
     - `npm run test` (if you add/maintain Jest tests)
   - Frontend:
     - `npm run lint`
     - `npm run build` (runs `tsc` then Vite build)

---

## 5. Summary

Uni Portal 360 is a realistic, end‑to‑end university management platform:

- Multi‑role (admin, faculty, student) with strict RBAC.
- Covers the full academic lifecycle:
  - Academic structure → course/offered course setup
  - Enrollment → attendance → assignments → submissions
  - Grading → results → transcripts
  - Fees & receipts
  - Notifications, audit logs, and analytics.

Use this README as a starting point to:

- Clone and run the application locally.
- Understand the major domains and flows.
- Extend modules (e.g., add new analytics, reports, or integrations) while reusing the existing patterns.
