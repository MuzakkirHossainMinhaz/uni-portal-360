import { ProfileOutlined, ReadOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Card, Col, DatePicker, Row, Select, Skeleton, Space, Statistic, Typography } from 'antd';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useGetDashboardStatsQuery, useGetEnrollmentTrendsQuery } from '../../redux/features/admin/analytics.api';
import { useThemeMode } from '../../theme/ThemeProvider';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const AdminDashboard = () => {
  const { mode } = useThemeMode();

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
    return tickItem;
  };

  const stats = statsData?.data;
  const chartData = trendsData?.data || [];

  if (statsError) {
    return <Alert description="Error loading dashboard data" type="error" showIcon />;
  }

  return (
    <div>
      {/* Metric Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            variant="borderless"
            hoverable
            style={{
              height: '100%',
              background: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.8)',
              border: mode === 'dark' ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(226,232,240,0.6)',
              borderRadius: 16,
              transition: 'all 0.3s ease',
              overflow: 'hidden',
            }}
            styles={{
              body: { padding: '24px' },
            }}
          >
            <Skeleton loading={statsLoading} active avatar paragraph={{ rows: 1 }}>
              <Statistic
                title={<Text type="secondary">Total Students</Text>}
                value={stats?.totalStudents}
                prefix={
                  <UserOutlined
                    style={{ color: '#0f6ad8', backgroundColor: '#e0f2fe', padding: 8, borderRadius: '50%' }}
                  />
                }
                styles={{ content: { fontWeight: 'bold', color: '#0f6ad8' } }}
              />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            variant="borderless"
            hoverable
            style={{
              height: '100%',
              background: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.8)',
              border: mode === 'dark' ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(226,232,240,0.6)',
              borderRadius: 16,
              transition: 'all 0.3s ease',
              overflow: 'hidden',
            }}
            styles={{
              body: { padding: '24px' },
            }}
          >
            <Skeleton loading={statsLoading} active avatar paragraph={{ rows: 1 }}>
              <Statistic
                title={<Text type="secondary">Total Courses</Text>}
                value={stats?.totalCourses}
                prefix={
                  <ReadOutlined
                    style={{ color: '#722ed1', backgroundColor: '#f9f0ff', padding: 8, borderRadius: '50%' }}
                  />
                }
                styles={{ content: { fontWeight: 'bold', color: '#722ed1' } }}
              />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            variant="borderless"
            hoverable
            style={{
              height: '100%',
              background: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.8)',
              border: mode === 'dark' ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(226,232,240,0.6)',
              borderRadius: 16,
              transition: 'all 0.3s ease',
              overflow: 'hidden',
            }}
            styles={{
              body: { padding: '24px' },
            }}
          >
            <Skeleton loading={statsLoading} active avatar paragraph={{ rows: 1 }}>
              <Statistic
                title={<Text type="secondary">Total Faculty</Text>}
                value={stats?.totalFaculties}
                prefix={
                  <TeamOutlined
                    style={{ color: '#fa8c16', backgroundColor: '#fff7e6', padding: 8, borderRadius: '50%' }}
                  />
                }
                styles={{ content: { fontWeight: 'bold', color: '#fa8c16' } }}
              />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            variant="borderless"
            hoverable
            style={{
              height: '100%',
              background: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.8)',
              border: mode === 'dark' ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(226,232,240,0.6)',
              borderRadius: 16,
              transition: 'all 0.3s ease',
              overflow: 'hidden',
            }}
            styles={{
              body: { padding: '24px' },
            }}
          >
            <Skeleton loading={statsLoading} active avatar paragraph={{ rows: 1 }}>
              <Statistic
                title={<Text type="secondary">Total Enrollments</Text>}
                value={stats?.totalEnrollments}
                prefix={
                  <ProfileOutlined
                    style={{ color: '#52c41a', backgroundColor: '#f6ffed', padding: 8, borderRadius: '50%' }}
                  />
                }
                styles={{ content: { fontWeight: 'bold', color: '#52c41a' } }}
              />
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Enrollment Growth Chart */}
      <div
        style={{
          background: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.8)',
          borderRadius: 16,
          border: mode === 'dark' ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(226,232,240,0.6)',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <Card
          title="Enrollment Growth"
          variant="borderless"
          styles={{
            header: {
              background: mode === 'dark' ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.8)',
              borderBottom: mode === 'dark' ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(226,232,240,0.6)',
              padding: '20px 24px',
            },
            body: { padding: '24px' },
          }}
          extra={
            <Space wrap>
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
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height={350} aspect={undefined}>
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f6ad8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0f6ad8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="_id"
                    tickFormatter={formatXAxis}
                    tick={{ fill: '#8c8c8c', fontSize: 12 }}
                    axisLine={{ stroke: '#f0f0f0' }}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis tick={{ fill: '#8c8c8c', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.96)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderRadius: 8,
                      padding: '8px 12px',
                    }}
                    cursor={{ stroke: '#0f6ad8', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Enrollments"
                    stroke="#0f6ad8"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorEnrollments)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
