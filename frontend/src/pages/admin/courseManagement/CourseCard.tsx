import { Card, Flex, Space, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useThemeMode } from '../../../theme/ThemeProvider';

const CourseCard = ({ title, subtitle, actions, children }: { title: string; subtitle: string; actions?: ReactNode; children: ReactNode }) => {
  const { mode } = useThemeMode();
  return (
    <Card style={{
      background: mode === 'dark' ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.98)',
      borderRadius: 16,
      border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)',
    }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={16} style={{ marginBottom: 16 }}>
        <Space orientation="vertical" size={4}>
          <Typography.Title level={3} style={{ margin: 0 }}>{title}</Typography.Title>
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        </Space>
        {actions}
      </Flex>
      {children}
    </Card>
  );
};

export default CourseCard;
