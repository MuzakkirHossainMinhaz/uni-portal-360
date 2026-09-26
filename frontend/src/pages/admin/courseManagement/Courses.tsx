import { DeleteOutlined, EditOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { Alert, App, Button, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState, type Key } from 'react';
import PermissionGuard from '../../../components/layout/PermissionGuard';
import { selectCurrentUser, selectUserPermissions } from '../../../redux/features/auth/authSlice';
import { useAppSelector } from '../../../redux/hooks';
import { useGetAllFacultiesQuery } from '../../../redux/features/admin/userManagement.api';
import {
  useAddCourseMutation, useAddFacultiesMutation, useDeleteCourseMutation, useGetAllCoursesQuery,
  useGetCourseFacultiesQuery, useRemoveFacultiesMutation, useUpdateCourseMutation,
} from '../../../redux/features/admin/courseManagement';
import type { TCourse } from '../../../types';
import CourseCard from './CourseCard';

type CourseValues = { title: string; prefix: string; code: number; credits: number; prerequisites?: string[] };
const courseId = (value: string | TCourse | null) => typeof value === 'string' ? value : value?._id;
const errorText = (error: unknown) => (error as { data?: { message?: string } })?.data?.message ?? 'Operation failed. Please try again.';

const FacultyAssignment = ({ course, onClose }: { course: TCourse; onClose: () => void }) => {
  const { message } = App.useApp();
  const [selection, setSelection] = useState<string[]>([]);
  const { data, isLoading } = useGetCourseFacultiesQuery(course._id);
  const { data: facultyData } = useGetAllFacultiesQuery([{ name: 'limit', value: 100 }]);
  const [assign, { isLoading: assigning }] = useAddFacultiesMutation();
  const [remove, { isLoading: removing }] = useRemoveFacultiesMutation();
  const assigned = data?.faculties ?? [];
  const available = facultyData?.data?.filter((faculty) => !faculty.isDeleted && !assigned.some((item) => item._id === faculty._id)) ?? [];
  const handleAssign = async () => {
    if (!selection.length) return;
    try {
      await assign({ courseId: course._id, data: selection }).unwrap();
      setSelection([]);
      message.success('Faculty assigned');
    } catch (error) { message.error(errorText(error)); }
  };
  const handleRemove = async (facultyId: string) => {
    try {
      await remove({ courseId: course._id, data: [facultyId] }).unwrap();
      message.success('Faculty removed');
    } catch (error) { message.error(errorText(error)); }
  };
  return (
    <Modal title={`Faculty for ${course.title}`} open onCancel={onClose} footer={null} width={620}>
      <Space wrap style={{ marginBottom: 16 }}>
        {assigned.length ? assigned.map((faculty) => (
          <Tag key={faculty._id} closable={!removing} onClose={(event) => { event.preventDefault(); void handleRemove(faculty._id); }}>
            {faculty.fullName || faculty._id}
          </Tag>
        )) : <span>{isLoading ? 'Loading faculty...' : 'No faculty assigned yet'}</span>}
      </Space>
      <Space.Compact style={{ width: '100%' }}>
        <Select mode="multiple" value={selection} onChange={setSelection} placeholder="Select faculty" style={{ width: '100%' }}
          options={available.map((faculty) => ({ value: faculty._id, label: faculty.fullName || faculty.id }))} />
        <Button type="primary" loading={assigning} disabled={!selection.length} onClick={handleAssign}>Assign</Button>
      </Space.Compact>
    </Modal>
  );
};

const Courses = () => {
  const { message, modal } = App.useApp();
  const user = useAppSelector(selectCurrentUser);
  const permissions = useAppSelector(selectUserPermissions);
  const canDelete = user?.role === 'superAdmin' || permissions.includes('deleteCourse');
  const [form] = Form.useForm<CourseValues>();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<TCourse | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [facultyCourse, setFacultyCourse] = useState<TCourse | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const params = useMemo(() => [{ name: 'page', value: page }, { name: 'limit', value: size }, ...(search ? [{ name: 'searchTerm', value: search }] : [])], [page, size, search]);
  const { data, isFetching, error } = useGetAllCoursesQuery(params);
  const { data: courseOptions } = useGetAllCoursesQuery([{ name: 'limit', value: 100 }]);
  const [create, { isLoading: creating }] = useAddCourseMutation();
  const [update, { isLoading: updating }] = useUpdateCourseMutation();
  const [remove, { isLoading: deleting }] = useDeleteCourseMutation();
  const openCreate = () => { setEditing(null); form.resetFields(); setFormOpen(true); };
  const openEdit = (course: TCourse) => {
    setEditing(course);
    form.setFieldsValue({ title: course.title, prefix: course.prefix, code: course.code, credits: course.credits,
      prerequisites: course.preRequisiteCourses?.filter((item) => !item.isDeleted).map((item) => courseId(item.course)).filter((id): id is string => Boolean(id)) ?? [] });
    setFormOpen(true);
  };
  const save = async (values: CourseValues) => {
    const payload = { title: values.title.trim(), prefix: values.prefix.trim().toUpperCase(), code: values.code, credits: values.credits,
      preRequisiteCourses: (values.prerequisites ?? []).map((course) => ({ course, isDeleted: false })) };
    try {
      if (editing) await update({ id: editing._id, data: payload }).unwrap();
      else { await create(payload).unwrap(); setPage(1); }
      message.success(editing ? 'Course updated' : 'Course created');
      setFormOpen(false);
    } catch (error) { message.error(errorText(error)); }
  };
  const deleteOne = async (id: string) => {
    try { await remove(id).unwrap(); setSelectedRowKeys((keys) => keys.filter((key) => key !== id)); message.success('Course deleted'); }
    catch (error) { message.error(errorText(error)); }
  };
  const deleteSelected = async (ids: string[]) => {
    setBulkDeleting(true);
    try {
      const results = await Promise.allSettled(ids.map((id) => remove(id).unwrap()));
      const deletedIds = ids.filter((_, index) => results[index].status === 'fulfilled');
      setSelectedRowKeys((keys) => keys.filter((key) => !deletedIds.includes(String(key))));
      if (deletedIds.length === ids.length) setPage(1);
      if (deletedIds.length) message.success(`${deletedIds.length} course(s) deleted`);
      if (deletedIds.length !== ids.length) message.error(`${ids.length - deletedIds.length} course(s) could not be deleted. Check offerings and prerequisites.`);
    } finally { setBulkDeleting(false); }
  };
  const confirmBulkDelete = () => {
    const ids = selectedRowKeys.map(String);
    if (!ids.length || !canDelete) return;
    modal.confirm({ title: `Delete ${ids.length} course(s)?`, content: 'Courses used by active offerings or other prerequisites cannot be deleted.', centered: true, okText: 'Delete', okType: 'danger', onOk: () => deleteSelected(ids) });
  };
  const columns: ColumnsType<TCourse> = [
    { title: 'Course', dataIndex: 'title', sorter: (a, b) => a.title.localeCompare(b.title) },
    { title: 'Code', render: (_, row) => `${row.prefix}${row.code}` },
    { title: 'Credits', dataIndex: 'credits' },
    { title: 'Prerequisites', render: (_, row) => row.preRequisiteCourses?.filter((item) => !item.isDeleted).map((item) => typeof item.course === 'string' ? item.course : item.course?.title).filter(Boolean).join(', ') || 'None' },
    { title: 'Actions', render: (_, row) => <Space>
      <PermissionGuard permission="updateCourse"><Button type="text" icon={<EditOutlined />} aria-label="Edit course" onClick={() => openEdit(row)} /></PermissionGuard>
      <PermissionGuard permission="assignFaculties"><Button type="text" icon={<TeamOutlined />} aria-label="Manage faculty" onClick={() => setFacultyCourse(row)} /></PermissionGuard>
      <PermissionGuard permission="deleteCourse"><Button type="text" danger icon={<DeleteOutlined />} aria-label="Delete course" disabled={deleting || bulkDeleting} onClick={() => modal.confirm({ title: 'Delete this course?', content: 'Courses used by active offerings or other prerequisites cannot be deleted.', centered: true, okText: 'Delete', okType: 'danger', onOk: () => deleteOne(row._id) })} /></PermissionGuard>
    </Space> },
  ];
  return <>
    <CourseCard title="Courses" subtitle="Manage the course catalog, prerequisites, and teaching faculty" actions={<Space wrap>
      <PermissionGuard permission="deleteCourse"><Button type="dashed" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length || bulkDeleting} loading={bulkDeleting} onClick={confirmBulkDelete}>Delete ({selectedRowKeys.length})</Button></PermissionGuard>
      <PermissionGuard permission="createCourse"><Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Course</Button></PermissionGuard>
    </Space>}>
      <Input.Search placeholder="Search courses" allowClear value={searchDraft} onChange={(event) => {
        setSearchDraft(event.target.value);
        if (!event.target.value) { setSearch(''); setPage(1); setSelectedRowKeys([]); }
      }} onSearch={(value) => { setSearch(value.trim()); setPage(1); setSelectedRowKeys([]); }} style={{ maxWidth: 320, marginBottom: 16 }} />
      {error ? <Alert type="error" showIcon message="Could not load courses" /> : <Table rowKey="_id" columns={columns} dataSource={data?.data ?? []} loading={isFetching} scroll={{ x: 780 }}
        rowSelection={canDelete ? { selectedRowKeys, onChange: setSelectedRowKeys, getCheckboxProps: () => ({ disabled: bulkDeleting }) } : undefined}
        pagination={{ current: page, pageSize: size, total: data?.meta?.total ?? 0, showSizeChanger: true, onChange: (next, pageSize) => { setPage(next); setSize(pageSize); setSelectedRowKeys([]); } }} />}
    </CourseCard>
    <Modal title={editing ? 'Edit Course' : 'Add Course'} open={formOpen} onCancel={() => setFormOpen(false)} footer={null} forceRender width={640}>
      <Form form={form} layout="vertical" onFinish={save}>
        <Form.Item name="title" label="Title" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item>
        <Row gutter={16}>
          <Col xs={24} sm={8}><Form.Item name="prefix" label="Prefix" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item name="code" label="Code" rules={[{ required: true }]}><InputNumber min={1} precision={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item name="credits" label="Credits" rules={[{ required: true }]}><InputNumber min={0.5} step={0.5} style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
        <Form.Item name="prerequisites" label="Prerequisite courses"><Select mode="multiple" allowClear options={courseOptions?.data?.filter((item) => item._id !== editing?._id).map((item) => ({ value: item._id, label: `${item.prefix}${item.code} — ${item.title}` }))} /></Form.Item>
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}><Button onClick={() => setFormOpen(false)}>Cancel</Button><Button type="primary" htmlType="submit" loading={creating || updating}>{editing ? 'Save Changes' : 'Create Course'}</Button></Space>
      </Form>
    </Modal>
    {facultyCourse && <FacultyAssignment course={facultyCourse} onClose={() => setFacultyCourse(null)} />}
  </>;
};

export default Courses;
