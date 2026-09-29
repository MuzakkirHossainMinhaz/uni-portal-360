/* Run after npm run build. Uses a disposable database on the configured LOCAL MongoDB server. */
process.env.NODE_ENV ||= 'test';
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../dist/config').default;
const seedSuperAdmin = require('../dist/config/db').default;
const { AuthServices } = require('../dist/modules/Auth/auth.service');
const app = require('../dist/app').default;
const dbName = `uni_portal_quality_${randomUUID().replaceAll('-', '')}`;
const id = () => new mongoose.Types.ObjectId();
const ids = {
  department: id(),
  facultyGroup: id(),
  semester: id(),
  registration: id(),
  course: id(),
  offering: id(),
  teacher: id(),
  outsider: id(),
  studentA: id(),
  studentB: id(),
};
let server;
let checks = 0;
const check = (condition, message) => {
  assert.ok(condition, message);
  checks += 1;
  console.log(`PASS ${message}`);
};
const actors = {};
async function run() {
  if (!/^mongodb:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(config.database_url ?? ''))
    throw new Error('Quality smoke tests require a local MongoDB URL');
  await mongoose.connect(config.database_url, { dbName });
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  const db = mongoose.connection.db;
  delete process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD;
  await assert.rejects(seedSuperAdmin());
  check((await db.collection('users').countDocuments({ role: 'superAdmin' })) === 0, 'Fresh bootstrap refuses to create an account without a unique secret');
  process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD = `Quality-${randomUUID()}!`;
  await Promise.all([seedSuperAdmin(), seedSuperAdmin()]);
  const bootstrapAccounts = await db.collection('users').find({ id: 'SA-0001' }).toArray();
  check(bootstrapAccounts.length === 1 && bootstrapAccounts[0].needsPasswordChange, 'Concurrent bootstrap creates one Super Admin that must change its password');
  check(
    (await bcrypt.compare(process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD, bootstrapAccounts[0].password)) &&
      !(await bcrypt.compare('123456', bootstrapAccounts[0].password)),
    'Bootstrap uses the supplied secret rather than a published default',
  );
  for (const [key, role, profileId] of [
    ['admin', 'superAdmin'],
    ['teacher', 'faculty', ids.teacher],
    ['outsider', 'faculty', ids.outsider],
    ['studentA', 'student', ids.studentA],
    ['studentB', 'student', ids.studentB],
  ]) {
    const user = {
      _id: id(),
      id: `QA-${key}`,
      email: `${key}@quality.invalid`,
      password: 'unused',
      role,
      needsPasswordChange: false,
      status: 'in-progress',
      isDeleted: false,
    };
    await db.collection('users').insertOne(user);
    actors[key] = {
      ...user,
      profileId,
      token: jwt.sign({ userId: user.id, role }, config.jwt_access_secret, { expiresIn: '10m' }),
    };
    if (profileId)
      await db.collection(role === 'faculty' ? 'faculties' : 'students').insertOne({
        _id: profileId,
        id: user.id,
        email: user.email,
        user: user._id,
        name: { firstName: key, lastName: 'Quality' },
        academicDepartment: ids.department,
        academicFaculty: ids.facultyGroup,
        isDeleted: false,
      });
  }
  await db.collection('academicfaculties').insertOne({ _id: ids.facultyGroup, name: 'Quality Faculty' });
  await db
    .collection('academicdepartments')
    .insertOne({ _id: ids.department, name: 'Quality Department', academicFaculty: ids.facultyGroup });
  await db.collection('academicsemesters').insertOne({
    _id: ids.semester,
    name: 'Autumn',
    year: '2026',
    code: '01',
    startMonth: 'September',
    endMonth: 'December',
  });
  await db.collection('semesterregistrations').insertOne({
    _id: ids.registration,
    academicSemester: ids.semester,
    status: 'ONGOING',
    startDate: new Date('2026-01-01T00:00:00Z'),
    endDate: new Date('2027-01-01T00:00:00Z'),
    minCredit: 1,
    maxCredit: 12,
  });
  await db.collection('courses').insertOne({
    _id: ids.course,
    title: 'Quality Course',
    code: 101,
    prefix: 'QA',
    credits: 3,
    preRequisiteCourses: [],
    isDeleted: false,
  });
  await db.collection('coursefaculties').insertOne({ course: ids.course, faculties: [ids.teacher] });
  await db.collection('students').updateMany({}, { $set: { guardian: { fatherName: 'Private guardian' }, presentAddress: 'Private address' } });
  await db.collection('faculties').updateMany({}, { $set: { presentAddress: 'Private faculty address', bloodGroup: 'A+' } });
  const offering = {
    _id: ids.offering,
    course: ids.course,
    semesterRegistration: ids.registration,
    academicSemester: ids.semester,
    academicDepartment: ids.department,
    academicFaculty: ids.facultyGroup,
    faculty: ids.teacher,
    section: 1,
    maxCapacity: 1,
    days: ['Sun'],
    startTime: '09:00',
    endTime: '10:00',
  };
  await db.collection('offeredcourses').insertOne(offering);
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  async function api(actor, path, method = 'GET', body) {
    const response = await fetch(base + path, {
      method,
      headers: { authorization: actors[actor].token, 'content-type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = response.headers.get('content-type')?.includes('application/pdf')
      ? Buffer.from(await response.arrayBuffer())
      : await response.json();
    return { status: response.status, body: data, headers: response.headers };
  }
  for (const route of [
    '/users',
    '/users/roles',
    '/students',
    '/faculties',
    '/admins',
    '/academic-semesters',
    '/academic-faculties',
    '/academic-departments',
    '/courses',
    '/semester-registrations',
    '/analytics/dashboard-stats',
    '/analytics/enrollment-trends',
    '/analytics/pass-rate',
    '/attendance/admin/report',
  ]) {
    const result = await api('admin', route);
    check(result.status === 200, `Admin read endpoint ${route}`);
  }
  for (const [route, recordId] of [
    ['academic-faculties', ids.facultyGroup],
    ['academic-departments', ids.department],
    ['academic-semesters', ids.semester],
  ]) {
    const result = await api('admin', `/${route}/${recordId}`, 'DELETE');
    check(result.status === 409, `Referenced ${route} cannot be deleted`);
  }
  const unchangedDepartment = await api('admin', `/academic-departments/${ids.department}`, 'PATCH', {
    name: 'Quality Department',
    academicFaculty: ids.facultyGroup,
  });
  check(unchangedDepartment.status === 200, 'Referenced department can be edited without changing its parent');
  const duplicateSemester = id();
  await db.collection('academicsemesters').insertOne({ _id: duplicateSemester, name: 'Autumn', year: '2027', code: '01', startMonth: 'September', endMonth: 'December' });
  let response = await api('admin', `/academic-semesters/${duplicateSemester}`, 'PATCH', { year: '2026' });
  check(response.status === 409, 'Academic semester updates enforce year/name uniqueness');
  response = await api('teacher', '/offered-courses');
  check(response.status === 200 && response.body.data.length === 1, 'Faculty can load assigned courses');
  response = await api('teacher', '/fees');
  check(response.status === 403, 'Faculty cannot read global financial records');
  response = await api('teacher', '/faculties');
  check(response.status === 403, 'Faculty cannot read private faculty directory fields');
  response = await api('admin', `/courses/${ids.course}/get-faculties`);
  check(response.status === 200 && !('presentAddress' in response.body.data.faculties[0]), 'Course faculty lists expose only teaching identity');
  response = await api('outsider', `/offered-courses?faculty=${ids.teacher}`);
  check(response.status === 200 && response.body.data.length === 0, 'Client filters cannot override faculty ownership');
  response = await api('studentA', '/offered-courses/my-offered-courses');
  check(response.status === 200 && response.body.data.length === 1, 'Eligible student can load offered courses');
  await db.collection('semesterregistrations').updateOne({ _id: ids.registration }, { $set: { endDate: new Date('2000-01-01T00:00:00Z') } });
  response = await api('studentA', '/offered-courses/my-offered-courses');
  check(response.body.data.length === 0, 'Closed registration offerings are hidden');
  response = await api('studentA', '/enrolled-courses/create-enrolled-course', 'POST', { offeredCourse: ids.offering });
  check(response.status === 400, 'Closed registration rejects enrollment despite ONGOING status');
  await db.collection('semesterregistrations').updateOne({ _id: ids.registration }, { $set: { endDate: new Date('2027-01-01T00:00:00Z') } });
  const enrollmentResults = await Promise.all(
    ['studentA', 'studentB'].map((actor) =>
      api(actor, '/enrolled-courses/create-enrolled-course', 'POST', { offeredCourse: ids.offering }),
    ),
  );
  check(
    enrollmentResults.filter((result) => result.status === 200).length === 1 &&
      enrollmentResults.filter((result) => result.status === 409).length === 1,
    'Concurrent enrollment reserves the final seat exactly once',
  );
  const winner = enrollmentResults[0].status === 200 ? 'studentA' : 'studentB';
  const loser = winner === 'studentA' ? 'studentB' : 'studentA';
  check(
    (await db.collection('offeredcourses').findOne({ _id: ids.offering })).maxCapacity === 0,
    'Seat capacity remains consistent',
  );
  response = await api('teacher', '/enrolled-courses');
  check(response.status === 200 && !('guardian' in response.body.data[0].student) && response.body.data[0].student.id,
    'Faculty rosters hide private student fields');
  response = await api(winner, '/enrolled-courses/my-enrolled-courses');
  check(response.status === 200 && !('presentAddress' in response.body.data[0].faculty),
    'Student enrollments hide private faculty fields');
  response = await api('admin', `/courses/${ids.course}`, 'PATCH', { credits: 6 });
  check(response.status === 409, 'Credits are immutable once students are enrolled');
  const downstreamCourse = id();
  await db.collection('courses').insertOne({ _id: downstreamCourse, title: 'Downstream Course', prefix: 'QA', code: 102, credits: 3, preRequisiteCourses: [{ course: ids.course, isDeleted: false }], isDeleted: false });
  response = await api('admin', `/courses/${ids.course}`, 'PATCH', { preRequisiteCourses: [{ course: downstreamCourse }] });
  check(response.status === 400, 'Prerequisite cycles are rejected');
  response = await api('admin', `/students/${actors[winner].profileId}`, 'PATCH', { student: { name: {}, admissionSemester: id() } });
  check(response.status === 400, 'Student updates reject nonexistent admission semesters');
  response = await api('admin', `/faculties/${ids.teacher}`, 'DELETE');
  check(response.status === 409, 'Assigned active faculty cannot be archived');
  const attendance = {
    offeredCourse: ids.offering,
    date: '2026-09-27',
    attendanceList: [{ student: actors[winner].profileId, status: 'Present' }],
  };
  response = await api('teacher', '/attendance', 'POST', attendance);
  check(response.status === 201, `Faculty attendance saves (${response.status})`);
  response = await api('teacher', `/attendance/sheet?offeredCourse=${ids.offering}&date=2026-09-27`);
  check(response.body.data[0].status === 'Present', 'Saved attendance reloads in the faculty sheet');
  response = await api(winner, '/attendance/my-attendance');
  check(
    response.body.data.length === 1 && response.body.data[0].offeredCourse.course.title === 'Quality Course',
    'Student attendance resolves login ID and course title',
  );
  response = await api(loser, `/attendance/my-attendance?student=${actors[winner].profileId}`);
  check(response.body.data.length === 0, 'Students cannot read another student attendance');
  response = await api('outsider', '/attendance', 'POST', attendance);
  check(response.status === 404, 'Unassigned faculty cannot mark attendance');
  response = await api('teacher', '/attendance', 'POST', { ...attendance, date: '2099-01-01' });
  check(response.status === 400, 'Future attendance is rejected');
  const marks = {
    semesterRegistration: ids.registration,
    offeredCourse: ids.offering,
    student: actors[winner].profileId,
    courseMarks: { classTest1: 0, classTest2: 0, midTerm: 0, finalTerm: 0 },
  };
  response = await api('teacher', '/enrolled-courses/update-enrolled-course-marks', 'PATCH', marks);
  check(response.status === 200 && response.body.data.grade === 'NA', 'Draft zeros do not publish a result');
  response = await api(winner, '/semester-results/my-results');
  check(response.body.data.length === 0, 'Draft marks do not affect GPA');
  response = await api('teacher', '/enrolled-courses/update-enrolled-course-marks', 'PATCH', { ...marks, publish: true });
  check(response.status === 200 && response.body.data.grade === 'F', 'Explicit publication accepts legitimate zero marks');
  response = await api('teacher', '/enrolled-courses/update-enrolled-course-marks', 'PATCH', { ...marks, courseMarks: { finalTerm: 50 } });
  check(response.status === 409, 'Faculty cannot edit published marks');
  response = await api('admin', '/enrolled-courses/update-enrolled-course-marks', 'PATCH', { ...marks, courseMarks: { finalTerm: 50 } });
  check(response.status === 400, 'Admin corrections require an audit reason');
  response = await api(winner, '/semester-results/my-results');
  check(response.status === 200 && response.body.data[0].gpa === 0, 'Failing course produces a zero GPA result');
  const { SemesterResultServices } = require('../dist/modules/SemesterResult/semesterResult.service');
  const calculate = SemesterResultServices.calculateSemesterGPA;
  try {
    SemesterResultServices.calculateSemesterGPA = async () => {
      throw new Error('Intentional quality-test GPA failure');
    };
    response = await api('admin', '/enrolled-courses/update-enrolled-course-marks', 'PATCH', {
      ...marks,
      courseMarks: { finalTerm: 50 },
      correctionReason: 'Correct final examination mark after approval',
    });
    const persisted = await db.collection('enrolledcourses').findOne({ student: actors[winner].profileId });
    check(
      response.status === 500 && persisted.courseMarks.finalTerm === 0,
      'A GPA failure rolls back the corresponding marks update',
    );
  } finally {
    SemesterResultServices.calculateSemesterGPA = calculate;
  }
  response = await api('admin', '/enrolled-courses/update-enrolled-course-marks', 'PATCH', {
    ...marks, courseMarks: { finalTerm: 50 }, correctionReason: 'Correct final examination mark after approval',
  });
  check(response.status === 200 && response.body.data.grade === 'C' && response.body.data.gradeCorrections.length === 1,
    'Approved correction records before and after marks and recalculates grade');
  response = await api('teacher', '/attendance', 'POST', {
    ...attendance,
    attendanceList: [{ student: actors[winner].profileId, status: 'Absent' }],
  });
  check(
    response.status === 201 && (await db.collection('attendances').countDocuments()) === 1,
    'Editing attendance replaces the existing daily record',
  );
  response = await api('admin', '/attendance/admin/low-attendance');
  check(
    response.status === 200 &&
      response.body.data[0].courseDetails.course.title === 'Quality Course' &&
      response.body.data[0].studentDetails.fullName,
    'Low attendance report includes names and course titles',
  );
  response = await api('admin', '/attendance/admin/analytics');
  check(
    response.status === 200 && response.body.data.statusBreakdown[0]._id === 'Absent',
    'Attendance analytics reflects saved statuses',
  );
  await db.collection('semesterregistrations').updateOne({ _id: ids.registration }, { $set: { status: 'ENDED' } });
  response = await api('teacher', '/attendance', 'POST', attendance);
  check(response.status === 409, 'Closed semester rejects attendance edits');
  await db.collection('semesterregistrations').updateOne({ _id: ids.registration }, { $set: { status: 'ONGOING' } });
  await db.collection('semesterregistrations').updateOne({ _id: ids.registration }, { $set: { maxCredit: 2 } });
  await db.collection('offeredcourses').updateOne({ _id: ids.offering }, { $set: { maxCapacity: 1 } });
  response = await api(loser, '/enrolled-courses/create-enrolled-course', 'POST', { offeredCourse: ids.offering });
  check(response.status === 400, 'Credit limit applies even to the first enrollment');
  await db.collection('semesterregistrations').updateOne({ _id: ids.registration }, { $set: { maxCredit: 12 } });
  response = await api(winner, '/transcript');
  check(
    response.status === 200 && response.body.subarray(0, 4).toString() === '%PDF',
    'Transcript endpoint generates a PDF',
  );
  response = await api('teacher', '/assignments', 'POST', {
    title: 'Quality assignment',
    description: 'Smoke test',
    offeredCourse: ids.offering,
    deadline: '2099-01-01T00:00:00.000Z',
    faculty: ids.outsider,
  });
  check(
    response.status === 201 && response.body.data.faculty === String(ids.teacher),
    'Assignment creation uses authenticated faculty',
  );
  const assignmentId = response.body.data._id;
  response = await api(winner, '/assignments');
  check(
    Array.isArray(response.body.data) && response.body.data.length === 1 && response.body.meta.total === 1,
    'Assignment list uses the paginated array contract',
  );
  response = await api(loser, '/assignments');
  check(response.body.data.length === 0, 'Students only see assignments for enrolled courses');
  response = await api('outsider', `/assignments/${assignmentId}`, 'PATCH', { title: 'Wrong owner' });
  check(response.status === 404, 'Faculty cannot edit another faculty assignment');
  const submissionId = id();
  await db.collection('submissions').insertOne({
    _id: submissionId,
    assignment: new mongoose.Types.ObjectId(assignmentId),
    student: actors[winner].profileId,
    fileUrl: 'https://example.invalid/quality.pdf',
    submittedAt: new Date(),
    isGraded: false,
  });
  response = await api('outsider', `/submissions/${submissionId}/grade`, 'PATCH', { grade: 90 });
  check(response.status === 403, 'Faculty cannot grade another faculty submission');
  response = await api('teacher', `/submissions/${submissionId}/grade`, 'PATCH', { grade: 101 });
  check(response.status === 400, 'Submission grading enforces the 100-point maximum');
  response = await api('teacher', `/submissions/${submissionId}/grade`, 'PATCH', { grade: 0 });
  check(response.status === 200 && response.body.data.isGraded, 'Zero submission grades save correctly');
  response = await api(winner, `/submissions?assignmentIds=${assignmentId}&page=1&limit=10`);
  check(response.status === 200 && response.body.data.length === 1 && response.body.meta.total === 1, 'Student submission list is scoped and paginated');
  response = await api('teacher', `/submissions/${submissionId}/grade`, 'PATCH', { grade: 90 });
  check(response.status === 409, 'Faculty cannot overwrite a published assignment grade');
  response = await api('admin', `/submissions/${submissionId}/grade`, 'PATCH', { grade: 90 });
  check(response.status === 400, 'Admin assignment corrections require a reason');
  response = await api('admin', `/submissions/${submissionId}/grade`, 'PATCH', {
    grade: 90,
    correctionReason: 'Corrected after reviewing the marking rubric',
  });
  check(response.status === 200 && response.body.data.gradeCorrections.length === 1, 'Admin correction records assignment grade history');
  const submissionAudit = await db.collection('audit_logs').findOne({ entityId: String(submissionId), action: 'CORRECT_ASSIGNMENT_GRADE' });
  check(submissionAudit?.oldValues?.grade === 0 && submissionAudit?.newValues?.grade === 90, 'Assignment correction audit records before and after grades');
  await db.collection('coursefaculties').updateOne({ course: ids.course }, { $addToSet: { faculties: ids.outsider } });
  response = await api('admin', `/offered-courses/${ids.offering}`, 'PATCH', {
    faculty: ids.outsider,
    reassignmentReason: 'Teacher reassigned during the active semester',
  });
  check(response.status === 200 && response.body.data.faculty === String(ids.outsider), 'Admin can transfer an active course with a reason');
  check(
    (await db.collection('enrolledcourses').findOne({ offeredCourse: ids.offering })).faculty.equals(ids.outsider) &&
      (await db.collection('assignments').findOne({ _id: new mongoose.Types.ObjectId(assignmentId) })).faculty.equals(ids.outsider),
    'Active transfer updates grading and assignment ownership atomically',
  );
  response = await api('admin', `/faculties/${ids.teacher}`, 'DELETE');
  check(response.status === 200, 'Former faculty can be archived after transferring active teaching');
  response = await api('admin', '/fees', 'POST', {
    student: actors[winner].profileId,
    academicSemester: ids.semester,
    amount: 100,
    type: 'TUITION',
    dueDate: '2099-01-01',
  });
  check(response.status === 201, 'Admin can create a validated fee');
  const feeId = response.body.data._id;
  const createdFeeAudit = await db.collection('audit_logs').findOne({ entityId: String(feeId), action: 'CREATE_FEE' });
  check(createdFeeAudit?.newValues?.amount === 100, 'Fee creation records durable financial details');
  const oldNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  response = await api(winner, `/fees/${feeId}/pay`, 'PATCH');
  check(response.status === 503, 'Production cannot settle a fee through simulation');
  process.env.NODE_ENV = oldNodeEnv;
  response = await api(loser, `/fees/${feeId}/pay`, 'PATCH');
  check(response.status === 409, 'Students cannot pay another student fee');
  response = await api(winner, `/fees/${feeId}/pay`, 'PATCH');
  check(
    response.status === 200 && response.body.data.transactionId.startsWith('SIM-'),
    'Simulation payment records a server-generated receipt',
  );
  const paymentAudit = await db.collection('audit_logs').findOne({ entityId: String(feeId), action: 'SIMULATED_PAYMENT' });
  check(paymentAudit?.oldValues?.status === 'PENDING' && paymentAudit?.newValues?.status === 'PAID', 'Fee payment records before and after status in the same transaction');
  response = await api(winner, `/fees/${feeId}/pay`, 'PATCH');
  check(response.status === 409, 'Repeated fee payment is rejected');
  response = await api('admin', '/audit-logs');
  check(response.status === 200 && response.body.data.length > 0, 'Authenticated mutations produce audit records');
  response = await api(winner, '/notifications');
  check(
    response.status === 200 && response.body.meta.unreadCount > 0,
    'Result, assignment and fee notifications reach the student',
  );
  const notificationId = response.body.data[0]._id;
  response = await api(loser, `/notifications/${notificationId}/read`, 'PATCH');
  check(response.status === 404, 'Notification ownership is enforced');
  response = await api(winner, '/notifications/read-all', 'PATCH');
  check(response.status === 200, 'Student can mark notifications as read');
  response = await api(winner, '/notifications');
  check(response.body.meta.unreadCount === 0, 'Notification unread count updates correctly');
  response = await api('admin', '/auth/reset-password', 'POST', { id: actors.admin.id });
  check(response.status === 400, 'Password reset validates the required new password');
  const malformedUpload = new FormData();
  malformedUpload.append('data', '{invalid');
  const malformedResponse = await fetch(base + '/submissions/submit', {
    method: 'POST',
    headers: { authorization: actors[winner].token },
    body: malformedUpload,
  });
  check(malformedResponse.status === 400, 'Malformed submission form data returns a validation error');
  const existingUploads = new Set(await fs.readdir('uploads').catch(() => []));
  const rejectedUpload = new FormData();
  rejectedUpload.append('file', new Blob([Buffer.from('%PDF-1.7\nquality test')], { type: 'application/pdf' }), 'quality.pdf');
  const rejectedResponse = await fetch(base + `/submissions/${id()}`, {
    method: 'PATCH',
    headers: { authorization: actors[winner].token },
    body: rejectedUpload,
  });
  for (let attempt = 0; attempt < 20; attempt++) {
    const remaining = (await fs.readdir('uploads')).filter((name) => !existingUploads.has(name));
    if (remaining.length === 0) break;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  check(
    rejectedResponse.status === 404 &&
      (await fs.readdir('uploads')).every((name) => existingUploads.has(name)),
    'Rejected submission replacements remove their temporary upload',
  );
  actors.outsider.token = jwt.sign(
    { userId: actors.outsider.id, role: 'faculty', purpose: 'password-reset', passwordVersion: 0, sessionVersion: 0 },
    config.jwt_access_secret,
    { audience: 'password-reset', expiresIn: '10m' },
  );
  response = await api('outsider', '/auth/reset-password', 'POST', {
    id: actors.outsider.id,
    newPassword: 'Quality-only-password-123!',
  });
  check(response.status === 200, 'A scoped password reset token updates the password');
  response = await api('outsider', '/auth/login', 'POST', { id: actors.outsider.id, password: 'Quality-only-password-123!' });
  check(response.status === 200 && response.body.data.accessToken, 'New password can authenticate immediately');
  const refreshCookie = response.headers.get('set-cookie')?.split(';')[0];
  const refreshed = await fetch(base + '/auth/refresh-token', { method: 'POST', headers: { cookie: refreshCookie } });
  const refreshedBody = await refreshed.json();
  check(refreshed.status === 200 && refreshedBody.data.accessToken, 'Valid refresh cookie issues a new access token');
  actors.outsider.token = response.body.data.accessToken;
  response = await api('outsider', '/users/me');
  check(response.status === 200, 'Fresh token works in the password-change second');
  response = await api('outsider', '/auth/logout', 'POST');
  check(response.status === 200, 'Logout revokes the server session');
  response = await api('outsider', '/users/me');
  check(response.status === 401, 'Revoked session token cannot access protected routes');
  const revokedRefresh = await fetch(base + '/auth/refresh-token', { method: 'POST', headers: { cookie: refreshCookie } });
  check(revokedRefresh.status === 401, 'Logout also revokes the refresh cookie');
  const beforeStaleChange = await db.collection('users').findOne({ id: actors.outsider.id });
  const hashPassword = bcrypt.hash;
  bcrypt.hash = async (...args) => {
    await AuthServices.logoutUser(actors.outsider.id, beforeStaleChange.sessionVersion);
    return hashPassword(...args);
  };
  try {
    await assert.rejects(
      AuthServices.changePassword(
        { userId: actors.outsider.id, role: 'faculty' },
        { oldPassword: 'Quality-only-password-123!', newPassword: 'Stale-change-password-789!' },
      ),
      { statusCode: 409 },
    );
  } finally {
    bcrypt.hash = hashPassword;
  }
  const afterStaleChange = await db.collection('users').findOne({ id: actors.outsider.id });
  check(
    await bcrypt.compare('Quality-only-password-123!', afterStaleChange.password),
    'Concurrent logout prevents a stale password change from overwriting the credential',
  );
  actors.outsider.token = jwt.sign(
    { userId: actors.outsider.id, role: 'faculty', purpose: 'password-reset', passwordVersion: 0, sessionVersion: 0 },
    config.jwt_access_secret,
    { audience: 'password-reset', expiresIn: '10m' },
  );
  response = await api('outsider', '/auth/reset-password', 'POST', {
    id: actors.outsider.id,
    newPassword: 'Quality-only-password-456!',
  });
  check(response.status === 403, 'A password reset token cannot be reused');
  actors[winner].token = jwt.sign(
    { userId: actors[winner].id, role: 'student', purpose: 'password-reset' },
    config.jwt_access_secret,
    { audience: 'password-reset', expiresIn: '10m' },
  );
  response = await api(winner, '/fees/my-fees');
  check(response.status === 401, 'Password reset tokens cannot authenticate API requests');
  console.log(`Completed ${checks} API assertions in disposable database ${dbName}`);
}
run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState === 1) {
      if (mongoose.connection.name !== dbName || !/^uni_portal_quality_[a-f0-9]{32}$/.test(dbName))
        throw new Error('Refusing cleanup of an unexpected database');
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  });
