import { Breadcrumb, Space, Typography } from 'antd';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeMode } from '../../theme/ThemeProvider';

type PageHeaderProps = {
  title: string;
  subTitle?: string;
  breadcrumbs?: { title: string; href?: string }[];
  extra?: ReactNode;
};

const PageHeader = ({ title, subTitle, breadcrumbs, extra }: PageHeaderProps) => {
  const { mode } = useThemeMode();

  return (
    <div
      style={{
        marginBottom: 24,
        padding: '20px 24px',
        background: mode === 'dark' ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.98)',
        borderRadius: 16,
        border: mode === 'dark' ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(226,232,240,0.6)',
        boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 24,
        }}
      >
        {/* Left Side - Title and Subtitle */}
        <Space orientation="vertical" size={6}>
          <Typography.Title
            level={2}
            style={{
              margin: 0,
              fontWeight: 700,
              color: mode === 'dark' ? '#e5e7eb' : '#111827',
              letterSpacing: 0.5,
              fontSize: 24,
            }}
          >
            {title}
          </Typography.Title>
          {subTitle && (
            <Typography.Text
              type="secondary"
              style={{
                fontSize: 14,
                color: mode === 'dark' ? '#9ca3af' : '#6b7280',
                fontWeight: 400,
              }}
            >
              {subTitle}
            </Typography.Text>
          )}
        </Space>

        {/* Right Side - Breadcrumbs and Extra */}
        <Space orientation="vertical" size={12} align="end">
          {breadcrumbs && (
            <Breadcrumb
              items={breadcrumbs.map((item) => ({
                title: item.href ? <Link to={item.href}>{item.title}</Link> : item.title,
              }))}
              style={{
                color: mode === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            />
          )}
          {extra && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {extra}
            </div>
          )}
        </Space>
      </div>
    </div>
  );
};

export default PageHeader;
