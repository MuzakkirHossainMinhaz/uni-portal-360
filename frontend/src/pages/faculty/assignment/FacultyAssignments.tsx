import { Button, Card, Table, Tag, Typography, Space } from 'antd';
import { useGetAllAssignmentsQuery } from '../../../redux/features/assignment/assignment.api';
import { Link } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const FacultyAssignments = () => {
  const { data: assignments, isLoading } = useGetAllAssignmentsQuery(undefined);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Course Section',
      dataIndex: ['offeredCourse', 'section'],
      key: 'section',
      render: (text: any) => text ? <Tag color="blue">{text}</Tag> : 'N/A',
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date: string) => {
          const isExpired = dayjs().isAfter(dayjs(date));
          return (
              <Space direction="vertical" size={0}>
                  <Text>{dayjs(date).format('MMM D, YYYY h:mm A')}</Text>
                  {isExpired ? <Tag color="error">Closed</Tag> : <Tag color="success">Active</Tag>}
              </Space>
          );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => (
        <Link to={`/faculty/submissions/${record._id}`}>
          <Button icon={<EyeOutlined />} size="small">View Submissions</Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Assignments"
        subTitle="Manage assignments for your courses."
        breadcrumbs={[
            { title: 'Dashboard', href: '/faculty/dashboard' },
            { title: 'Assignments' },
        ]}
        extra={
            <Link to="/faculty/create-assignment">
                <Button type="primary" icon={<PlusOutlined />}>Create Assignment</Button>
            </Link>
        }
      />

      <Card bordered={false}>
          <Table
            dataSource={assignments?.data}
            columns={columns}
            loading={isLoading}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
      </Card>
    </div>
  );
};

export default FacultyAssignments;
