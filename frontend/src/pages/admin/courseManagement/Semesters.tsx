import { ArrowRightOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { DatePickerProps } from 'antd';
import { Alert, App, Button, Col, DatePicker, Form, InputNumber, Modal, Row, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState, type Key } from 'react';
import { useDatePickerPopupWidth } from '../../../components/form/useDatePickerPopupWidth';
import { useGetAllAcademicSemestersQuery } from '../../../redux/features/admin/academicManagement.api';
import {
  useAddRegisteredSemesterMutation, useDeleteRegisteredSemesterMutation,
  useGetAllRegisteredSemestersQuery, useUpdateRegisteredSemesterMutation,
} from '../../../redux/features/admin/courseManagement';
import type { TSemester } from '../../../types';
import CourseCard from './CourseCard';

type Values = { academicSemester: string; startDate: Dayjs; endDate: Dayjs; minCredit: number; maxCredit: number };
const errorText = (error: unknown) => (error as { data?: { message?: string } })?.data?.message ?? 'Operation failed. Please try again.';
const formatDate = (date: string) => new Date(date).toLocaleDateString();

const WidthMatchedDatePicker = (props: DatePickerProps) => {
  const { wrapperRef, popupWidth, measure } = useDatePickerPopupWidth();
  return <div ref={wrapperRef}>
    <DatePicker
      {...props}
      format="DD MMM YYYY"
      classNames={{ popup: { root: popupWidth ? 'date-picker-width-matched' : '' } }}
      styles={{ popup: { root: { width: popupWidth } } }}
      onOpenChange={(isOpen) => { if (isOpen) measure(); props.onOpenChange?.(isOpen); }}
      style={{ ...props.style, width: '100%' }}
    />
  </div>;
};

const Semesters = () => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<Values>();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [editing, setEditing] = useState<TSemester | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const params = useMemo(() => [{ name: 'page', value: page }, { name: 'limit', value: size }], [page, size]);
  const { data, isFetching, error } = useGetAllRegisteredSemestersQuery(params);
  const { data: academic } = useGetAllAcademicSemestersQuery([{ name: 'limit', value: 100 }]);
  const [create, { isLoading: creating }] = useAddRegisteredSemesterMutation();
  const [update, { isLoading: updating }] = useUpdateRegisteredSemesterMutation();
  const [remove, { isLoading: deleting }] = useDeleteRegisteredSemesterMutation();
  const add = () => { setEditing(null); form.resetFields(); setOpen(true); };
  const edit = (row: TSemester) => {
    setEditing(row);
    form.setFieldsValue({ academicSemester: row.academicSemester?._id, startDate: dayjs(row.startDate), endDate: dayjs(row.endDate), minCredit: row.minCredit, maxCredit: row.maxCredit });
    setOpen(true);
  };
  const save = async (values: Values) => {
    if (!values.endDate.isAfter(values.startDate, 'day') || values.maxCredit < values.minCredit) {
      message.error('Check the date range and credit limits'); return;
    }
    const payload = { ...values, startDate: values.startDate.startOf('day').toISOString(), endDate: values.endDate.startOf('day').toISOString() };
    try {
      if (editing) await update({ id: editing._id, data: { startDate: payload.startDate, endDate: payload.endDate, minCredit: payload.minCredit, maxCredit: payload.maxCredit } }).unwrap();
      else { await create({ ...payload, status: 'UPCOMING' }).unwrap(); setPage(1); }
      message.success(editing ? 'Registration updated' : 'Semester registered');
      setOpen(false);
    } catch (cause) { message.error(errorText(cause)); }
  };
  const advance = async (row: TSemester) => {
    const status = row.status === 'UPCOMING' ? 'ONGOING' : 'ENDED';
    try { await update({ id: row._id, data: { status } }).unwrap(); setSelectedRowKeys((keys) => keys.filter((key) => key !== row._id)); message.success(`Semester is now ${status.toLowerCase()}`); }
    catch (cause) { message.error(errorText(cause)); }
  };
  const deleteOne = async (id: string) => {
    try { await remove(id).unwrap(); setSelectedRowKeys((keys) => keys.filter((key) => key !== id)); message.success('Semester deleted'); }
    catch (cause) { message.error(errorText(cause)); }
  };
  const deleteSelected = async (ids: string[]) => {
    setBulkDeleting(true);
    try {
      const results = await Promise.allSettled(ids.map((id) => remove(id).unwrap()));
      const deletedIds = ids.filter((_, index) => results[index].status === 'fulfilled');
      setSelectedRowKeys((keys) => keys.filter((key) => !deletedIds.includes(String(key))));
      if (deletedIds.length === ids.length) setPage(1);
      if (deletedIds.length) message.success(`${deletedIds.length} semester(s) deleted`);
      if (deletedIds.length !== ids.length) message.error(`${ids.length - deletedIds.length} semester(s) could not be deleted`);
    } finally { setBulkDeleting(false); }
  };
  const confirmBulkDelete = () => {
    const ids = selectedRowKeys.map(String);
    if (!ids.length) return;
    modal.confirm({
      title: `Delete ${ids.length} semester(s)?`,
      content: 'Their offered courses will also be deleted.',
      centered: true, okText: 'Delete', okType: 'danger',
      onOk: () => deleteSelected(ids),
    });
  };
  const columns: ColumnsType<TSemester> = [
    { title: 'Academic Semester', render: (_, row) => row.academicSemester ? `${row.academicSemester.name} ${row.academicSemester.year}` : '—' },
    { title: 'Status', dataIndex: 'status', render: (status: TSemester['status']) => <Tag color={status === 'UPCOMING' ? 'blue' : status === 'ONGOING' ? 'green' : 'red'}>{status}</Tag> },
    { title: 'Start Date', dataIndex: 'startDate', render: formatDate },
    { title: 'End Date', dataIndex: 'endDate', render: formatDate },
    { title: 'Credits', render: (_, row) => `${row.minCredit}–${row.maxCredit}` },
    {
      title: 'Actions', render: (_, row) => <Space>
        {row.status === 'UPCOMING' && <Button type="text" icon={<EditOutlined />} aria-label="Edit registration" onClick={() => edit(row)} />}
        {row.status !== 'ENDED' && <Button type="text" icon={<ArrowRightOutlined />} aria-label={`Advance semester to ${row.status === 'UPCOMING' ? 'ONGOING' : 'ENDED'}`} title={`Advance to ${row.status === 'UPCOMING' ? 'ONGOING' : 'ENDED'}`} disabled={updating} onClick={() => modal.confirm({ title: `Move semester to ${row.status === 'UPCOMING' ? 'ONGOING' : 'ENDED'}?`, centered: true, okText: 'Advance', onOk: () => advance(row) })} />}
        {row.status === 'UPCOMING' && <Button type="text" danger icon={<DeleteOutlined />} aria-label="Delete semester" disabled={deleting || bulkDeleting} onClick={() => modal.confirm({ title: 'Delete this semester?', content: 'Its offered courses will also be deleted.', centered: true, okText: 'Delete', okType: 'danger', onOk: () => deleteOne(row._id) })} />}
      </Space>
    },
  ];
  return <>
    <CourseCard title="Semesters" subtitle="Manage registration dates, credit limits, and lifecycle" actions={<Space wrap>
      <Button type="dashed" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length || bulkDeleting} loading={bulkDeleting} onClick={confirmBulkDelete}>Delete ({selectedRowKeys.length})</Button>
      <Button type="primary" icon={<PlusOutlined />} onClick={add}>Add Semester</Button>
    </Space>}>
      {error ? <Alert type="error" showIcon message="Could not load semesters" /> : <Table rowKey="_id" columns={columns} dataSource={data?.data ?? []} loading={isFetching} scroll={{ x: 800 }}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys, getCheckboxProps: (row) => ({ disabled: row.status !== 'UPCOMING' || bulkDeleting }) }}
        pagination={{ current: page, pageSize: size, total: data?.meta?.total ?? 0, showSizeChanger: true, onChange: (next, pageSize) => { setPage(next); setSize(pageSize); setSelectedRowKeys([]); } }} />}
    </CourseCard>
    <Modal title={editing ? 'Edit Registration' : 'Add Semester'} open={open} onCancel={() => setOpen(false)} footer={null} forceRender width={620}>
      <Form form={form} layout="vertical" onFinish={save}>
        <Form.Item name="academicSemester" label="Academic Semester" rules={[{ required: true }]}>
          <Select disabled={Boolean(editing)} options={academic?.data?.map((semester) => ({ value: semester._id, label: `${semester.name} ${semester.year}` }))} />
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} sm={12}><Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}><WidthMatchedDatePicker /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="endDate" label="End Date" rules={[{ required: true }]}><WidthMatchedDatePicker /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="minCredit" label="Minimum Credits" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="maxCredit" label="Maximum Credits" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
        <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }} size={8}><Button onClick={() => setOpen(false)} disabled={creating || updating}>Cancel</Button><Button type="primary" htmlType="submit" loading={creating || updating}>{editing ? 'Update' : 'Create'}</Button></Space>
      </Form>
    </Modal>
  </>;
};

export default Semesters;
