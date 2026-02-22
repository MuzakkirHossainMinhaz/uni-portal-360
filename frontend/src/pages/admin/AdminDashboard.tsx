import { Card, Col, Row, Statistic, Select, Spin, Alert, DatePicker, Space } from 'antd';
import {
  UserOutlined,
  ReadOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  useGetDashboardStatsQuery,
  useGetEnrollmentTrendsQuery,
} from '../../redux/features/admin/analytics.api';
import { useState } from 'react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const AdminDashboard = () => {
  // Stats with 30s polling
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetDashboardStatsQuery(undefined, {
    pollingInterval: 30000,
  });

  // Chart data
  const [period, setPeriod] = useState('last6months');
  const [customRange, setCustomRange] = useState<[string, string] | null>(null);

  const queryParams = {
    period,
    ...(period === 'custom' && customRange ? { startDate: customRange[0], endDate: customRange[1] } : {}),
  };

  const {
    data: trendsData,
    isLoading: trendsLoading,
    isFetching: trendsFetching,
  } = useGetEnrollmentTrendsQuery(queryParams);

  const formatXAxis = (tickItem: string) => {
    // Assuming backend returns 'YYYY-MM-DD' or 'YYYY-MM'
    // Can format based on period if needed
    return tickItem;
  };

  if (statsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (statsError) {
    return <Alert message="Error loading dashboard data" type="error" />;
  }

  const stats = statsData?.data;
  const chartData = trendsData?.data || [];

  return (
    <div style={{ padding: '0 10px' }}>
      <h1 style={{ marginBottom: 24, fontSize: '24px', fontWeight: 600 }}>
        Dashboard Overview
      </h1>

      {/* Metric Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} hoverable style={{ borderRadius: 8 }}>
            <Statistic
              title={
                <span style={{ fontSize: 16, color: '#8c8c8c' }}>
                  Total Students
                </span>
              }
              value={stats?.totalStudents}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} hoverable style={{ borderRadius: 8 }}>
            <Statistic
              title={
                <span style={{ fontSize: 16, color: '#8c8c8c' }}>
                  Total Courses
                </span>
              }
              value={stats?.totalCourses}
              prefix={<ReadOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Enrollment Growth Chart */}
      <div style={{ marginTop: 32 }}>
        <Card
          title="Enrollment Growth"
          bordered={false}
          style={{ borderRadius: 8 }}
          extra={
            <Space>
                {period === 'custom' && (
                    <RangePicker 
                        onChange={(dates, dateStrings) => {
                            if (dates) {
                                setCustomRange([dateStrings[0], dateStrings[1]]);
                            }
                        }}
                    />
                )}
                <Select
                  defaultValue="last6months"
                  style={{ width: 150 }}
                  onChange={(value) => setPeriod(value)}
                  options={[
                    { value: 'last7days', label: 'Last 7 Days' },
                    { value: 'last30days', label: 'Last 30 Days' },
                    { value: 'last6months', label: 'Last 6 Months' },
                    { value: 'custom', label: 'Custom Range' },
                  ]}
                />
            </Space>
          }
        >
          {trendsLoading || trendsFetching ? (
            <div
              style={{
                height: 350,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Spin />
            </div>
          ) : (
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="_id"
                    tickFormatter={formatXAxis}
                    tick={{ fill: '#666' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#666' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      borderRadius: 4,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Enrollments"
                    stroke="#1890ff"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#1890ff', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
