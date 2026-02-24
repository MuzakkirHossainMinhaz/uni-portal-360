import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, Typography } from 'antd';
import { useState } from 'react';
import { TUser, useCurrentToken } from '../../redux/features/auth/authSlice';
import { useAppSelector } from '../../redux/hooks';
import { adminPaths } from '../../routes/admin.routes';
import { facultyPaths } from '../../routes/faculty.routes';
import { studentPaths } from '../../routes/student.routes';
import { useThemeMode } from '../../theme/ThemeProvider';
import { sidebarItemsGenerator } from '../../utils/sidebarItemsGenerator';
import { verifyToken } from '../../utils/verifyToken';

const { Sider } = Layout;

const userRole = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
  SUPER_ADMIN: 'superAdmin',
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const token = useAppSelector(useCurrentToken);
  const { mode } = useThemeMode();

  let user;

  if (token) {
    user = verifyToken(token);
  }

  let sidebarItems;

  switch ((user as TUser)!.role) {
    case userRole.SUPER_ADMIN:
    case userRole.ADMIN:
      sidebarItems = sidebarItemsGenerator(adminPaths, userRole.ADMIN);
      break;
    case userRole.FACULTY:
      sidebarItems = sidebarItemsGenerator(facultyPaths, userRole.FACULTY);
      break;
    case userRole.STUDENT:
      sidebarItems = sidebarItemsGenerator(studentPaths, userRole.STUDENT);
      break;

    default:
      break;
  }

  return (
    <Sider
      width={280}
      collapsedWidth={80}
      collapsed={collapsed}
      breakpoint="lg"
      onBreakpoint={(broken) => {
        if (broken) {
          setCollapsed(true);
        }
      }}
      style={{
        height: '100vh',
        position: 'relative',
        top: '0',
        left: '0',
        background:
          mode === 'dark'
            ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderRight: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo and Text */}
      <div
        style={{
          color: mode === 'dark' ? 'white' : '#111827',
          height: '4rem',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-start',
          alignItems: 'center',
          padding: collapsed ? '0' : '0 16px',
          gap: collapsed ? 0 : 10,
          borderBottom: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <img
          src="/logo.png"
          alt="Uni Portal 360"
          style={{
            height: 52,
            width: 52,
            objectFit: 'contain',
          }}
        />
        {!collapsed && (
          <div>
            <Typography.Text
              style={{
                color: mode === 'dark' ? 'white' : '#111827',
                fontWeight: 600,
                letterSpacing: 0.5,
                fontSize: 18,
              }}
            >
              Uni Portal 360
            </Typography.Text>
            <Typography.Text
              style={{
                color: mode === 'dark' ? '#9ca3af' : '#6b7280',
                display: 'block',
                fontSize: 11,
                marginTop: -4,
              }}
            >
              Intelligent University Management
            </Typography.Text>
          </div>
        )}
      </div>

      {/* Menu */}
      <Menu
        theme={mode === 'dark' ? 'dark' : 'light'}
        mode="inline"
        defaultSelectedKeys={['dashboard']}
        openKeys={openKeys}
        onOpenChange={(keys) => {
          // Keep only the last opened key (accordion behavior)
          setOpenKeys(keys.length > 0 ? [keys[keys.length - 1]] : []);
        }}
        items={sidebarItems ?? []}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: 14,
          flex: 1,
          overflowY: 'auto',
        }}
      />

      {/* Footer */}
      <div
        style={{
          width: '100%',
          padding: '4px',
          borderTop: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)',
          marginTop: 'auto',
          position: 'absolute',
          bottom: 0,
        }}
      >
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            color: mode === 'dark' ? 'white' : '#111827',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '4px' : '8px 12px',
            borderRadius: 8,
            transition: 'all 0.3s ease',
            height: 40,
          }}
        >
          {!collapsed && 'Collapse'}
        </Button>
      </div>
    </Sider>
  );
};

export default Sidebar;
