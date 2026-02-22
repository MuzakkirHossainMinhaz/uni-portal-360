import { Breadcrumb, Typography, Space } from 'antd';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type PageHeaderProps = {
  title: string;
  subTitle?: string;
  breadcrumbs?: { title: string; href?: string }[];
  extra?: ReactNode;
};

const PageHeader = ({ title, subTitle, breadcrumbs, extra }: PageHeaderProps) => {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumbs && (
        <Breadcrumb
          items={breadcrumbs.map((item) => ({
            title: item.href ? <Link to={item.href}>{item.title}</Link> : item.title,
          }))}
          style={{ marginBottom: 16 }}
        />
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <Space direction="vertical" size={4}>
          <Typography.Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            {title}
          </Typography.Title>
          {subTitle && (
            <Typography.Text type="secondary" style={{ fontSize: 14 }}>
              {subTitle}
            </Typography.Text>
          )}
        </Space>
        {extra && <div>{extra}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
