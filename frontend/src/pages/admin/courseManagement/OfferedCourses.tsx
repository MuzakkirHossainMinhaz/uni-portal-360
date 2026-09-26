import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, App, Button, Col, Form, InputNumber, Modal, Row, Select, Space, Table, Tag, TimePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState, type Key } from 'react';
import { weekDaysOptions } from '../../../constants/global';
import { useGetAllAcademicDepartmentsQuery, useGetAllAcademicFacultiesQuery } from '../../../redux/features/admin/academicManagement.api';
import {
  useCreateOfferedCourseMutation, useDeleteOfferedCourseMutation, useGetAllCoursesQuery,
  useGetAllOfferedCoursesQuery, useGetAllRegisteredSemestersQuery, useGetCourseFacultiesQuery,
  useUpdateOfferedCourseMutation,
} from '../../../redux/features/admin/courseManagement';
import type { TOfferedCourse } from '../../../types';
import CourseCard from './CourseCard';

type Values = { semesterRegistration: string; academicFaculty: string; academicDepartment: string; course: string; faculty: string; section: number; maxCapacity: number; days: string[]; startTime: Dayjs; endTime: Dayjs };
const errorText = (error: unknown) => (error as { data?: { message?: string } })?.data?.message ?? 'Operation failed. Please try again.';
const facultyName = (faculty: TOfferedCourse['faculty']) => faculty?.name ? [faculty.name.firstName, faculty.name.middleName, faculty.name.lastName].filter(Boolean).join(' ') : '—';

const OfferedCourses = () => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<Values>();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [editing, setEditing] = useState<TOfferedCourse | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selectedFaculty = Form.useWatch('academicFaculty', form);
  const selectedDepartment = Form.useWatch('academicDepartment', form);
  const selectedCourse = Form.useWatch('course', form);
  const params = useMemo(() => [{ name: 'page', value: page }, { name: 'limit', value: size }], [page, size]);
  const { data, isFetching, error } = useGetAllOfferedCoursesQuery(params);
  const { data: semesters } = useGetAllRegisteredSemestersQuery([{ name: 'status', value: 'UPCOMING' }, { name: 'limit', value: 100 }]);
  const { data: academicFaculties } = useGetAllAcademicFacultiesQuery([{ name: 'limit', value: 100 }]);
  const { data: departments } = useGetAllAcademicDepartmentsQuery([{ name: 'limit', value: 100 }]);
  const { data: courses } = useGetAllCoursesQuery([{ name: 'limit', value: 100 }]);
  const { data: assigned } = useGetCourseFacultiesQuery(selectedCourse ?? '', { skip: !selectedCourse || !open });
  const [create, { isLoading: creating }] = useCreateOfferedCourseMutation();
  const [update, { isLoading: updating }] = useUpdateOfferedCourseMutation();
  const [remove, { isLoading: deleting }] = useDeleteOfferedCourseMutation();
  const upcomingIds = new Set(semesters?.data?.map((semester) => semester._id));
  const openCreate = () => { setEditing(null); form.resetFields(); setOpen(true); };
  const openEdit = (row: TOfferedCourse) => {
    setEditing(row);
    form.setFieldsValue({ semesterRegistration: row.semesterRegistration?._id, academicFaculty: row.academicFaculty?._id,
      academicDepartment: row.academicDepartment?._id, course: row.course?._id, faculty: row.faculty?._id,
      section: row.section, maxCapacity: row.maxCapacity, days: row.days,
      startTime: dayjs(`2000-01-01T${row.startTime}:00`), endTime: dayjs(`2000-01-01T${row.endTime}:00`) });
    setOpen(true);
  };
  const save = async (values: Values) => {
    if (!values.endTime.isAfter(values.startTime)) { message.error('End time must be later than start time'); return; }
    const startTime = values.startTime.format('HH:mm');
    const endTime = values.endTime.format('HH:mm');
    try {
      if (editing) {
        await update({ id: editing._id, data: { faculty: values.faculty, maxCapacity: values.maxCapacity, days: values.days, startTime, endTime } }).unwrap();
      } else {
        await create({ ...values, startTime, endTime }).unwrap(); setPage(1);
      }
      message.success(editing ? 'Offering updated' : 'Course offered');
      setOpen(false);
    } catch (cause) { message.error(errorText(cause)); }
  };
  const deleteOne = async (id: string) => {
    try { await remove(id).unwrap(); setSelectedRowKeys((keys) => keys.filter((key) => key !== id)); message.success('Offering deleted'); }
    catch (cause) { message.error(errorText(cause)); }
  };
  const deleteSelected = async (ids: string[]) => {
    setBulkDeleting(true);
    try {
      const results = await Promise.allSettled(ids.map((id) => remove(id).unwrap()));
      const deletedIds = ids.filter((_, index) => results[index].status === 'fulfilled');
      setSelectedRowKeys((keys) => keys.filter((key) => !deletedIds.includes(String(key))));
      if (deletedIds.length === ids.length) setPage(1);
      if (deletedIds.length) message.success(`${deletedIds.length} offering(s) deleted`);
      if (deletedIds.length !== ids.length) message.error(`${ids.length - deletedIds.length} offering(s) could not be deleted`);
    } finally { setBulkDeleting(false); }
  };
  const confirmBulkDelete = () => {
    const ids = selectedRowKeys.map(String);
    if (!ids.length) return;
    modal.confirm({ title: `Delete ${ids.length} offered course(s)?`, centered: true, okText: 'Delete', okType: 'danger', onOk: () => deleteSelected(ids) });
  };
  const columns: ColumnsType<TOfferedCourse> = [
    { title: 'Course', render: (_, row) => row.course ? `${row.course.prefix}${row.course.code} — ${row.course.title}` : '—' },
    { title: 'Semester', render: (_, row) => row.academicSemester ? `${row.academicSemester.name} ${row.academicSemester.year}` : '—' },
    { title: 'Department', render: (_, row) => row.academicDepartment?.name ?? '—' },
    { title: 'Section', dataIndex: 'section' },
    { title: 'Faculty', render: (_, row) => facultyName(row.faculty) },
    { title: 'Schedule', render: (_, row) => `${row.days?.join(', ') ?? ''} · ${row.startTime}–${row.endTime}` },
    { title: 'Capacity', dataIndex: 'maxCapacity' },
    { title: 'Status', render: (_, row) => <Tag color={row.semesterRegistration?.status === 'UPCOMING' ? 'blue' : row.semesterRegistration?.status === 'ONGOING' ? 'green' : 'default'}>{row.semesterRegistration?.status ?? '—'}</Tag> },
    { title: 'Actions', render: (_, row) => row.semesterRegistration?.status === 'UPCOMING' ? <Space>
      <Button type="text" icon={<EditOutlined />} aria-label="Edit offering" onClick={() => openEdit(row)} />
      <Button type="text" danger icon={<DeleteOutlined />} aria-label="Delete offering" disabled={deleting || bulkDeleting} onClick={() => modal.confirm({ title: 'Delete this offered course?', centered: true, okText: 'Delete', okType: 'danger', onOk: () => deleteOne(row._id) })} />
    </Space> : '—' },
  ];
  const departmentOptions = departments?.data?.filter((department) => department.academicFaculty?._id === selectedFaculty)
    .map((department) => ({ value: department._id, label: department.name }));
  const facultyOptions = assigned?.faculties?.filter((faculty) => {
    const member = faculty as typeof faculty & { academicDepartment?: string | { _id: string } };
    const departmentId = typeof member.academicDepartment === 'string' ? member.academicDepartment : member.academicDepartment?._id;
    return !departmentId || departmentId === selectedDepartment;
  }).map((faculty) => ({ value: faculty._id, label: faculty.fullName || faculty._id })) ?? [];
  return <>
    <CourseCard title="Offered Courses" subtitle="Plan sections, faculty, capacity, and weekly schedules" actions={<Space wrap>
      <Button type="dashed" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length || bulkDeleting} loading={bulkDeleting} onClick={confirmBulkDelete}>Delete ({selectedRowKeys.length})</Button>
      <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Offer Course</Button>
    </Space>}>
      {error ? <Alert type="error" showIcon message="Could not load offered courses" /> : <Table rowKey="_id" columns={columns} dataSource={data?.data ?? []} loading={isFetching} scroll={{ x: 1150 }}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys, getCheckboxProps: (row) => ({ disabled: row.semesterRegistration?.status !== 'UPCOMING' || bulkDeleting }) }}
        pagination={{ current: page, pageSize: size, total: data?.meta?.total ?? 0, showSizeChanger: true, onChange: (next, pageSize) => { setPage(next); setSize(pageSize); setSelectedRowKeys([]); } }} />}
    </CourseCard>
    <Modal title={editing ? 'Edit Offering' : 'Offer Course'} open={open} onCancel={() => setOpen(false)} footer={null} forceRender width={760}>
      <Form form={form} layout="vertical" onFinish={save}>
        <Row gutter={16}>
          <Col xs={24} sm={12}><Form.Item name="semesterRegistration" label="Registered Semester" rules={[{ required: true }]}><Select disabled={Boolean(editing)} options={semesters?.data?.map((semester) => ({ value: semester._id, label: `${semester.academicSemester?.name} ${semester.academicSemester?.year}` }))} /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="academicFaculty" label="Academic Faculty" rules={[{ required: true }]}><Select disabled={Boolean(editing)} options={academicFaculties?.data?.map((faculty) => ({ value: faculty._id, label: faculty.name }))} onChange={() => form.setFieldsValue({ academicDepartment: undefined, faculty: undefined })} /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="academicDepartment" label="Department" rules={[{ required: true }]}><Select disabled={Boolean(editing) || !selectedFaculty} options={departmentOptions} onChange={() => form.setFieldValue('faculty', undefined)} /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="course" label="Course" rules={[{ required: true }]}><Select disabled={Boolean(editing)} options={courses?.data?.map((course) => ({ value: course._id, label: `${course.prefix}${course.code} — ${course.title}` }))} onChange={() => form.setFieldValue('faculty', undefined)} /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="faculty" label="Assigned Faculty" rules={[{ required: true }]}><Select disabled={!selectedCourse || !selectedDepartment} options={facultyOptions} placeholder="Assign faculty on Courses first" /></Form.Item></Col>
          <Col xs={24} sm={6}><Form.Item name="section" label="Section" rules={[{ required: true }]}><InputNumber disabled={Boolean(editing)} min={1} precision={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={24} sm={6}><Form.Item name="maxCapacity" label="Capacity" rules={[{ required: true }]}><InputNumber min={1} precision={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={24}><Form.Item name="days" label="Days" rules={[{ required: true, type: 'array', min: 1 }]}><Select mode="multiple" options={weekDaysOptions} /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="startTime" label="Start Time" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="endTime" label="End Time" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
        {!editing && !upcomingIds.size && <Alert style={{ marginBottom: 16 }} type="info" showIcon message="Register an upcoming semester before offering courses." />}
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}><Button onClick={() => setOpen(false)}>Cancel</Button><Button type="primary" htmlType="submit" loading={creating || updating}>{editing ? 'Save Changes' : 'Offer Course'}</Button></Space>
      </Form>
    </Modal>
  </>;
};

export default OfferedCourses;
