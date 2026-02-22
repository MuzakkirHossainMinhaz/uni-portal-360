import {
  Button,
  Pagination,
  Space,
  Table,
  TableColumnsType,
  TableProps,
  Card,
  Input,
  Row,
  Col,
} from 'antd';
import { useState } from 'react';
import { TQueryParam, TStudent } from '../../../types';
import { useGetAllStudentsQuery } from '../../../redux/features/admin/userManagement.api';
import { Link } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import { SearchOutlined } from '@ant-design/icons';

export type TTableData = Pick<
  TStudent,
  'fullName' | 'id' | 'email' | 'contactNo'
>;

const StudentData = () => {
  const [params, setParams] = useState<TQueryParam[]>([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: studentData,
    isFetching,
  } = useGetAllStudentsQuery([
    { name: 'page', value: page },
    { name: 'sort', value: 'id' },
    { name: 'searchTerm', value: searchTerm },
    ...params,
  ]);

  const metaData = studentData?.meta;

  const tableData = studentData?.data?.map(
    ({ _id, fullName, id, email, contactNo }) => ({
      key: _id,
      fullName,
      id,
      email,
      contactNo,
    })
  );

  const columns: TableColumnsType<TTableData> = [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'fullName',
    },
    {
      title: 'Roll No.',
      key: 'id',
      dataIndex: 'id',
    },
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email',
    },
    {
      title: 'Contact No.',
      key: 'contactNo',
      dataIndex: 'contactNo',
    },
    {
      title: 'Action',
      key: 'x',
      render: (item) => {
        return (
          <Space>
            <Link to={`/admin/student-data/${item.key}`}>
              <Button size="small">Details</Button>
            </Link>
            <Button size="small">Update</Button>
            <Button size="small" danger>Block</Button>
          </Space>
        );
      },
      width: '1%',
    },
  ];

  const onChange: TableProps<TTableData>['onChange'] = (
    _pagination,
    filters,
    _sorter,
    extra
  ) => {
    if (extra.action === 'filter') {
      const queryParams: TQueryParam[] = [];

      filters.name?.forEach((item) =>
        queryParams.push({ name: 'name', value: item })
      );

      filters.year?.forEach((item) =>
        queryParams.push({ name: 'year', value: item })
      );

      setParams(queryParams);
    }
  };

  return (
    <div>
      <PageHeader
        title="Student Management"
        subTitle="Manage student records, enrollments, and profiles."
        breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'User Management' },
            { title: 'Students' },
        ]}
      />
      
      <Card bordered={false}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
            <Col>
                <Input 
                    placeholder="Search students..." 
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    style={{ width: 300 }}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                />
            </Col>
            <Col>
                 <Space>
                    <Button>Filter</Button>
                    <Link to="/admin/create-student">
                         <Button type="primary">Add Student</Button>
                    </Link>
                 </Space>
            </Col>
        </Row>

        <Table
            loading={isFetching}
            columns={columns}
            dataSource={tableData}
            onChange={onChange}
            pagination={false}
        />
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
                current={page}
                onChange={(value) => setPage(value)}
                pageSize={metaData?.limit}
                total={metaData?.total}
                showSizeChanger={false}
            />
        </div>
      </Card>
    </div>
  );
};

export default StudentData;
