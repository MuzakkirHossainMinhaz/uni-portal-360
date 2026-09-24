import { baseApi } from '../../api/baseApi';

export type Account = {
  _id: string;
  id: string;
  email: string;
  role: string;
  status: string;
  isDeleted: boolean;
  needsPasswordChange: boolean;
};

export type RoleGuide = {
  role: string;
  label: string;
  category: 'Core' | 'System owner' | 'Unsupported';
  purpose: string;
  portal: string | null;
  managementPath: string | null;
  accounts: number;
  deletedAccounts: number;
};

type AccountPage = {
  data: Account[];
  meta: { page: number; limit: number; total: number };
};

const userDirectoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountDirectory: builder.query<
      AccountPage,
      {
        page: number;
        limit: number;
        search?: string;
        role?: string;
        includeDeleted: boolean;
      }
    >({
      query: (params) => ({ url: '/users', method: 'GET', params }),
    }),
    getRoleGuide: builder.query<RoleGuide[], void>({
      query: () => ({ url: '/users/roles', method: 'GET' }),
      transformResponse: (response: { data: RoleGuide[] }) => response.data,
    }),
  }),
});

export const { useGetAccountDirectoryQuery, useGetRoleGuideQuery } = userDirectoryApi;
