import { Layout, Menu, Typography } from 'antd';
import { sidebarItemsGenerator } from '../../utils/sidebarItemsGenerator';
import { adminPaths } from '../../routes/admin.routes';
import { facultyPaths } from '../../routes/faculty.routes';
import { studentPaths } from '../../routes/student.routes';
import { useAppSelector } from '../../redux/hooks';
import {
  TUser,
  useCurrentToken,
} from '../../redux/features/auth/authSlice';
import { verifyToken } from '../../utils/verifyToken';

const { Sider } = Layout;

const userRole = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
  SUPER_ADMIN: 'superAdmin',
};

const Sidebar = () => {
  const token = useAppSelector(useCurrentToken);

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
      breakpoint="lg"
      collapsedWidth="0"
      style={{ height: '100vh', position: 'sticky', top: '0', left: '0' }}
    >
      <div
        style={{
          color: 'white',
          height: '4rem',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: '0 16px',
          gap: 10,
        }}
      >
        <img
          src="/logo.png"
          alt="Uni Portal 360"
          style={{ height: 28, width: 28, objectFit: 'contain' }}
        />
        <Typography.Text
          style={{
            color: 'white',
            fontWeight: 600,
            letterSpacing: 0.4,
            fontSize: 16,
          }}
        >
          Uni Portal 360
        </Typography.Text>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['4']}
        items={sidebarItems ?? []}
      />
    </Sider>
  );
};

export default Sidebar;
