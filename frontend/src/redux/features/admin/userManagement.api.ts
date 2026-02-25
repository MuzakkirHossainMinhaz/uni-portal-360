import { TMeta, TQueryParam, TResponseRedux, TStudent } from '../../../types';

import { baseApi } from '../../api/baseApi';

type PaginatedStudents = {
  data?: TStudent[];
  meta?: TMeta;
};

const userManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Student endpoints
    getAllStudents: builder.query<PaginatedStudents, TQueryParam[] | undefined>({
      query: (args) => {
        console.log(args);
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }

        return {
          url: '/students',
          method: 'GET',
          params: params,
        };
      },
      transformResponse: (response: TResponseRedux<TStudent[]>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    }),
    getSingleStudent: builder.query({
      query: (id: string) => ({
        url: `/students/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),
    addStudent: builder.mutation<TStudent, unknown>({
      query: (data) => ({
        url: '/users/create-student',
        method: 'POST',
        body: data,
      }),
    }),
    updateStudent: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/students/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),
    deleteStudent: builder.mutation({
      query: (id: string) => ({
        url: `/students/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    // Faculty endpoints
    getAllFaculties: builder.query<PaginatedStudents, TQueryParam[] | undefined>({
      query: (args) => {
        console.log(args);
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }

        return {
          url: '/faculties',
          method: 'GET',
          params: params,
        };
      },
      transformResponse: (response: TResponseRedux<TStudent[]>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    }),
    getSingleFaculty: builder.query({
      query: (id: string) => ({
        url: `/faculties/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),
    addFaculty: builder.mutation({
      query: (data) => ({
        url: '/users/create-faculty',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),
    updateFaculty: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/faculties/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),
    deleteFaculty: builder.mutation({
      query: (id: string) => ({
        url: `/faculties/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    // Admin endpoints
    getAllAdmins: builder.query({
      query: () => ({
        url: '/admins',
        method: 'GET',
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),
    getSingleAdmin: builder.query({
      query: (id: string) => ({
        url: `/admins/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),
    addAdmin: builder.mutation({
      query: (data) => ({
        url: '/users/create-admin',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),
    updateAdmin: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/admins/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),
    deleteAdmin: builder.mutation({
      query: (id: string) => ({
        url: `/admins/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    // Member endpoints
    getAllMembers: builder.query({
      query: () => ({
        url: '/members',
        method: 'GET',
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),
    getSingleMember: builder.query({
      query: (id: string) => ({
        url: `/members/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),
    addMember: builder.mutation({
      query: (data) => ({
        url: '/users/create-member',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),
    updateMember: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/members/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),
    deleteMember: builder.mutation({
      query: (id: string) => ({
        url: `/members/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    changePassword: builder.mutation<null, { oldPassword: string; newPassword: string }>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAllStudentsQuery,
  useGetSingleStudentQuery,
  useAddStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetAllFacultiesQuery,
  useGetSingleFacultyQuery,
  useAddFacultyMutation,
  useUpdateFacultyMutation,
  useDeleteFacultyMutation,
  useGetAllAdminsQuery,
  useGetSingleAdminQuery,
  useAddAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useGetAllMembersQuery,
  useGetSingleMemberQuery,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  useChangePasswordMutation,
} = userManagementApi;
