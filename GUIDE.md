# Uni Portal 360 – Feature Walkthrough Guide

This guide is for beginner developers who want to **run the project locally** and then **manually check every major feature** of Uni Portal 360.

Follow the sections **in order**:

1. Setup and run backend and frontend
2. Log in as Super Admin
3. Configure basic academic data
4. Create an Admin, Faculty, and Student
5. Create courses and offer them in a semester
6. Enroll a student
7. Work through attendance, assignments, submissions, grading, results, and transcripts
8. Check fees, receipts, notifications, audit logs, and analytics

You do not need to know much about Node, React, or MongoDB to follow this – just run the commands as shown.

---

## 1. Setup and Run the Application

### 1.1 Prerequisites

- Node.js 18 or newer
- npm (comes with Node)
- MongoDB running locally or a MongoDB Atlas connection string

### 1.2 Clone and Install

```bash
git clone <your-repo-url> uni-portal-360
cd uni-portal-360
```

#### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=mongodb://localhost:27017/uni-portal-360

JWT_ACCESS_SECRET=dev_access_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=dev_refresh_secret
JWT_REFRESH_EXPIRES_IN=365d

BCRYPT_SALT_ROUNDS=10

RESET_PASS_UI_LINK=http://localhost:5173/reset-password

SUPER_ADMIN_PASSWORD=superadmin123
```

You can change values later, but these are good defaults for local testing.

Start the backend:

```bash
npm run dev
```

What happens on first start:

- Connects to MongoDB
- Seeds **RBAC roles and permissions**
- Seeds a **Super Admin** user using `backend/src/db/index.ts`:
  - ID: `SA-0001`
  - Email: `superadmin@uni-portal-360.com`
  - Password: `123456`

#### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## 2. Log In as Super Admin

Open the browser at:

- `http://localhost:5173`

Log in with:

- **User ID**: `SA-0001`
- **Password**: `123456`

If you see a dashboard with admin-style cards and menus, the basic auth, RBAC, and frontend–backend connection are working.

---

## 3. Super Admin – Basic Admin and User Management

In this step you will:

1. Create an Admin user
2. Create a Faculty user
3. Create a Student user

These users will be used later to test features for each role.

### 3.1 Create an Admin User

1. Log in as **Super Admin**.
2. Go to the **Admin** or **User Management** section (left-hand menu).
3. Open **Create Admin**.
4. Fill out the form (name, email, contact info, etc.).
5. Submit the form.

What happens:

- Backend creates a `User` with role `admin` and generated ID like `A-0001`.
- Backend creates an `Admin` profile linked to that user.

Note: If the form asks for a password and you leave it blank, the backend uses `DEFAULT_PASS` from `.env` (`config.default_password`).

Record the generated **Admin ID** (e.g., `A-0001`) and email – you will use them later to log in.

### 3.2 Create a Faculty User

1. Still as **Super Admin**, go to **Create Faculty**.
2. Fill out faculty details (name, department, contact).
3. Submit.

Result:

- A `User` with role `faculty` and ID like `F-0001`.
- A `Faculty` profile linked to that user.

Record the generated **Faculty ID** (e.g., `F-0001`).

### 3.3 Create a Student User

Student IDs depend on academic semester, so first you will create one academic semester (next section) and then a student. For now, just know you will create a student later and get an ID like `2026010001`.

---

## 4. Academic Setup – Semesters, Faculties, Departments, Courses

All of this is done as **Super Admin** or **Admin**.

### 4.1 Create an Academic Semester

1. Log in as **Super Admin**.
2. Go to **Academic > Semesters**.
3. Click **Create Semester**.
4. Enter:
   - Name: `Spring`
   - Year: `2026`
   - Start/End dates
   - Any credit limits if required
5. Save.

You now have at least one academic semester (e.g., `Spring 2026`).

### 4.2 Create Academic Faculty and Department

1. Go to **Academic > Faculties**.
2. Create a faculty (e.g., `School of Engineering`).
3. Go to **Academic > Departments**.
4. Create a department under that faculty (e.g., `Computer Science`).

### 4.3 Create a Course

1. Go to **Courses**.
2. Click **Create Course**.
3. Fill in:
   - Title: `Introduction to Programming`
   - Code: `CSE101`
   - Credit: `3`
4. Save.

### 4.4 Assign Faculty to Course (if applicable)

If there is a **Course–Faculty** or **Assign Faculty** screen:

1. Open it and choose:
   - Course: `CSE101`
   - Faculty: the faculty you created (e.g., `F-0001`)
2. Save.

Now the faculty is allowed to teach that course.

---

## 5. Semester Registration and Offered Courses

### 5.1 Create a Semester Registration

1. Still as **Super Admin/Admin**, open **Semester Registrations**.
2. Click **Create Semester Registration**.
3. Choose:
   - Academic Semester: `Spring 2026`
   - Registration start/end dates
   - Minimum and maximum credits per student
4. Save.

You should see a list entry like `Spring 2026 (UPCOMING/ONGOING)`.

### 5.2 Offer a Course in that Semester

1. Go to **Offered Courses**.
2. Click **Create Offered Course**.
3. Select:
   - Semester Registration: the one you just created
   - Course: `CSE101`
   - Department: `Computer Science`
   - Faculty: your faculty user
   - Section: e.g., `A`
   - Days: `["Sun", "Tue"]`
   - Start/End time
   - Capacity: e.g., `50`
4. Save.

Now there is at least one offered course that students can enroll in.

---

## 6. Create a Student and Enroll in Courses

### 6.1 Create a Student

1. Log in as **Super Admin/Admin**.
2. Go to **User Management > Create Student**.
3. Fill out:
   - Personal info
   - Academic department
   - Academic semester (`Spring 2026`)
4. Submit.

The backend:

- Generates a student ID like `2026010001` based on semester.
- Creates both `User` and `Student` documents.

Record the **Student ID** (e.g., `2026010001`).

### 6.2 Log In as Student

1. Log out from Super Admin.
2. On the login page, use:
   - User ID: the generated student ID (e.g., `2026010001`)
   - Password:
     - If you did not set a custom password, use the backend `DEFAULT_PASS` from `.env`.
3. Confirm that you land on a **Student Dashboard**.

### 6.3 Enroll the Student in the Offered Course

1. As **Student**, go to the **Enrollment** or **My Offered Courses** page.
2. You should see the offered course `CSE101` for `Spring 2026`.
3. Click **Enroll**.
4. Confirm the course moves to an **Enrolled Courses** or similar section.

You are now ready to test attendance, assignments, and grading.

---

## 7. Faculty – Attendance, Assignments, and Gradebook

### 7.1 Log In as Faculty and Check Courses

1. Log out from Student.
2. Log in as **Faculty** using the generated faculty ID (e.g., `F-0001`) and password.
3. Go to **My Courses**.
4. You should see `CSE101` and related semester information.

### 7.2 Mark Attendance

1. In the faculty area, open **Attendance**.
2. Select:
   - Course: `CSE101` section `A`
   - Date: today
3. The student you enrolled earlier should appear in the list.
4. Mark them **Present** (or **Absent/Late**) and click **Save Attendance**.
5. Check that a success message appears.

### 7.3 Create an Assignment

1. Still as **Faculty**, open **Assignments** (e.g., **Create Assignment**).
2. Choose:
   - Course: `CSE101`
   - Title: `Homework 1`
   - Description: anything
   - Due date: a date in the near future
3. Save.

The student will see this assignment in their portal.

### 7.4 Gradebook Setup

1. Open **Gradebook** in the faculty area.
2. Select course `CSE101`.
3. Confirm that enrolled students appear in the list with editable marks.
4. Leave marks empty for now; you will fill them after submission.

---

## 8. Student – Assignments and Submissions

### 8.1 View Assignments

1. Log out from Faculty.
2. Log in again as **Student**.
3. Open **My Assignments**.
4. Confirm that `Homework 1` is listed with the correct due date and description.

### 8.2 Submit an Assignment

1. From **My Assignments**, click **Submit Assignment** for `Homework 1`.
2. A modal with a file upload area should appear.
3. Choose a small test file (e.g., a `.txt` file).
4. Click **Submit**.
5. Verify you see a success toast/notification.

---

## 9. Faculty – Review Submissions and Grade

### 9.1 Review Submissions

1. Log back in as **Faculty**.
2. Open **Submissions** for the assignment (`Homework 1`).
3. You should see the student’s submission, including:
   - Student name/ID
   - Submission time
   - Link/button to the uploaded file.

### 9.2 Grade the Submission

1. For the student’s row, click **Grade**.
2. Enter a numeric grade (e.g., `90`) and optional feedback.
3. Submit.
4. Confirm:
   - The grade column updates.
   - A success message is shown.

### 9.3 Enter Detailed Marks in Gradebook

1. Open **Gradebook** again.
2. Select course `CSE101`.
3. Click **Update Marks** for the student.
4. Fill:
   - Class Test 1
   - Mid Term
   - Class Test 2
   - Final Term
5. Save.

The backend will recalculate grades and GPA based on these marks.

---

## 10. Student – Results, Transcript, Attendance, and Fees

### 10.1 View Attendance

1. Log in as **Student**.
2. Go to **Attendance** or **My Attendance** page.
3. Confirm:
   - Summary percentages
   - Detailed attendance list for `CSE101`.

### 10.2 View Semester Result

1. Open **Results** or **My Results**.
2. Select `Spring 2026`.
3. Confirm:
   - Course list including `CSE101`
   - Grade and GPA.

### 10.3 View Transcript

1. Open **Transcript** or **My Transcript**.
2. Confirm:
   - All semesters and courses appear.
   - Grades and GPA are consistent with the results page.

### 10.4 Pay Fees and Download Receipt

First, an Admin must create a fee.

#### 10.4.1 Create a Fee as Admin

1. Log in as **Admin** (the user you created earlier).
2. Go to **Fees > Manage Fees** (or similar).
3. Click **Create Fee**.
4. Fill in:
   - Student: the student you created
   - Semester: `Spring 2026`
   - Type: `Tuition`
   - Amount: `1000`
   - Due date: some date
5. Save.

#### 10.4.2 Pay Fee as Student

1. Log back in as **Student**.
2. Go to **My Fees**.
3. You should see the newly created fee with status `Pending` or `Overdue`.
4. Click **Pay Now**.
5. After the simulated payment, confirm:
   - Status changes to `PAID`/`Paid`.
   - Pending dues total is updated.
6. Click **Download Receipt**.
7. Confirm that:
   - A PDF is generated and downloaded.
   - It shows your name, ID, fee type, semester, amount, and transaction ID.

---

## 11. Notifications, Audit Logs, and Analytics

### 11.1 Notifications

1. Trigger some events (creating assignments, grading, payments, etc.).
2. As Student or Faculty, look for a **notification bell** icon in the header.
3. Click it and verify:
   - Unread count badge
   - Notification list
   - Ability to mark notifications as read or delete them.

### 11.2 Audit Logs (Admin)

1. Log in as **Super Admin** or **Admin**.
2. Go to **Audit Logs**.
3. Confirm:
   - List of actions with who did what and when.
   - Filtering/pagination if available.

### 11.3 Analytics Dashboard

1. Still as **Admin** or **Super Admin**, open the **Dashboard** or **Analytics** page.
2. Confirm:
   - Summary metrics (students, courses, faculty, enrollments, etc.).
   - Charts showing enrollment trends and/or attendance analytics.

---

## 12. Quick Checklist – Have You Tested Everything?

Use this as a final checklist:

- [ ] Backend `.env` configured and backend started
- [ ] Frontend started and reachable at `http://localhost:5173`
- [ ] Logged in as **Super Admin** using `SA-0001`
- [ ] Created Admin, Faculty, and Student users
- [ ] Created academic semester, faculty, department, and course
- [ ] Created semester registration and offered course
- [ ] Student enrolled in offered course
- [ ] Faculty marked attendance for enrolled student
- [ ] Faculty created assignment
- [ ] Student submitted assignment
- [ ] Faculty graded submission and updated marks in gradebook
- [ ] Student viewed attendance, results, and transcript
- [ ] Admin created fee and student paid it
- [ ] Student downloaded PDF fee receipt
- [ ] Notifications appeared and could be marked as read/deleted
- [ ] Audit logs visible to Super Admin/Admin
- [ ] Admin/Super Admin dashboard shows analytics and charts

If all of these steps work on your machine, you have successfully verified **all major features** of Uni Portal 360 end to end.**_ End Patch_**
