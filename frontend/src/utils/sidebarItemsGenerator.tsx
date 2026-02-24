import { NavLink } from 'react-router-dom';
import { TSidebarItem, TUserPath } from '../types';
import {
  DashboardOutlined,
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  AuditOutlined,
  SettingOutlined,
  FileTextOutlined,
  ReadOutlined,
  BankOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

const getIconForItem = (itemName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Dashboard': <DashboardOutlined />,
    'Academic Management': <AppstoreOutlined />,
    'Create A. Semester': <CalendarOutlined />,
    'Academic Semester': <CalendarOutlined />,
    'Create A. Faculty': <TeamOutlined />,
    'Academic Faculty': <TeamOutlined />,
    'Create A. Department': <BankOutlined />,
    'Academic Department': <BankOutlined />,
    'User Management': <UserOutlined />,
    'Create Student': <UserOutlined />,
    'Students': <UserOutlined />,
    'Create Admin': <SettingOutlined />,
    'Create Faculty': <TeamOutlined />,
    'Create Member': <UserOutlined />,
    'Course Management': <BookOutlined />,
    'Semester Registration': <FileTextOutlined />,
    'Registered Semesters': <CalendarOutlined />,
    'Create Course': <BookOutlined />,
    'Courses': <BookOutlined />,
    'Offer Course': <ReadOutlined />,
    'Offered Courses': <ReadOutlined />,
    'Fee Management': <DollarOutlined />,
    'Manage Fees': <DollarOutlined />,
    'System': <SettingOutlined />,
    'Audit Logs': <AuditOutlined />,
  };
  
  return iconMap[itemName] || <DashboardOutlined />;
};

export const sidebarItemsGenerator = (items: TUserPath[], role: string) => {
  const sidebarItems = items.reduce((acc: TSidebarItem[], item) => {
    if (item.path && item.name) {
      acc.push({
        key: item.name,
        icon: getIconForItem(item.name),
        label: <NavLink to={`/${role}/${item.path}`}>{item.name}</NavLink>,
      });
    }

    if (item.children) {
      acc.push({
        key: item.name!,
        icon: getIconForItem(item.name!),
        label: item.name,
        children: item.children
          .map((child) => {
            if (child.name) {
              return {
                key: child.name,
                icon: getIconForItem(child.name),
                label: <NavLink to={`/${role}/${child.path}`}>{child.name}</NavLink>,
              };
            }
            return undefined;
          })
          .filter((item): item is Exclude<typeof item, undefined> => item !== undefined),
      });
    }

    return acc;
  }, []);

  return sidebarItems;
};
