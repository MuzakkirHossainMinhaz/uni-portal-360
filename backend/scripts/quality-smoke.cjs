/* Run after npm run build. Uses a disposable database on the configured LOCAL MongoDB server. */
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../dist/config').default;
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
    return { status: response.status, body: data };
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
  let response = await api('teacher', '/offered-courses');
  check(response.status === 200 && response.body.data.length === 1, 'Faculty can load assigned courses');
  response = await api('outsider', `/offered-courses?faculty=${ids.teacher}`);
  check(response.status === 200 && response.body.data.length === 0, 'Client filters cannot override faculty ownership');
  response = await api('studentA', '/offered-courses/my-offered-courses');
  check(response.status === 200 && response.body.data.length === 1, 'Eligible student can load offered courses');
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
  const marks = {
    semesterRegistration: ids.registration,
    offeredCourse: ids.offering,
    student: actors[winner].profileId,
    courseMarks: { classTest1: 0, classTest2: 0, midTerm: 0, finalTerm: 0 },
  };
  response = await api('teacher', '/enrolled-courses/update-enrolled-course-marks', 'PATCH', marks);
  check(response.status === 200 && response.body.data.grade === 'F', 'Zero final marks publish a failing grade');
  response = await api(winner, '/semester-results/my-results');
  check(response.status === 200 && response.body.data[0].gpa === 0, 'Failing course produces a zero GPA result');
  const { SemesterResultServices } = require('../dist/modules/SemesterResult/semesterResult.service');
  const calculate = SemesterResultServices.calculateSemesterGPA;
  try {
    SemesterResultServices.calculateSemesterGPA = async () => {
      throw new Error('Intentional quality-test GPA failure');
    };
    response = await api('teacher', '/enrolled-courses/update-enrolled-course-marks', 'PATCH', {
      ...marks,
      courseMarks: { finalTerm: 50 },
    });
    const persisted = await db.collection('enrolledcourses').findOne({ student: actors[winner].profileId });
    check(
      response.status === 500 && persisted.courseMarks.finalTerm === 0,
      'A GPA failure rolls back the corresponding marks update',
    );
  } finally {
    SemesterResultServices.calculateSemesterGPA = calculate;
  }
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
  response = await api('admin', '/fees', 'POST', {
    student: actors[winner].profileId,
    academicSemester: ids.semester,
    amount: 100,
    type: 'TUITION',
    dueDate: '2099-01-01',
  });
  check(response.status === 201, 'Admin can create a validated fee');
  const feeId = response.body.data._id;
  response = await api(loser, `/fees/${feeId}/pay`, 'PATCH');
  check(response.status === 409, 'Students cannot pay another student fee');
  response = await api(winner, `/fees/${feeId}/pay`, 'PATCH');
  check(
    response.status === 200 && response.body.data.transactionId.startsWith('SIM-'),
    'Simulation payment records a server-generated receipt',
  );
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
  actors.outsider.token = jwt.sign(
    { userId: actors.outsider.id, role: 'faculty', purpose: 'password-reset', passwordVersion: 0 },
    config.jwt_access_secret,
    { audience: 'password-reset', expiresIn: '10m' },
  );
  response = await api('outsider', '/auth/reset-password', 'POST', {
    id: actors.outsider.id,
    newPassword: 'Quality-only-password-123!',
  });
  check(response.status === 200, 'A scoped password reset token updates the password');
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
