import { TAdmin, TFaculty, TMeta, TQueryParam, TResponseRedux, TStudent } from '../../../types';

import { baseApi } from '../../api/baseApi';

type PaginatedUsers<T> = {
  data: T[];
  meta?: TMeta;
};

const userManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Student endpoints
    getAllStudents: builder.query<PaginatedUsers<TStudent>, TQueryParam[] | undefined>({
      query: (args) => {
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
          data: response.data ?? [],
          meta: response.meta,
        };
      },
      providesTags: ['Students'],
    }),
    getSingleStudent: builder.query<TStudent, string>({
      query: (id: string) => ({
        url: `/students/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: TResponseRedux<TStudent>) => response.data as TStudent,
    }),
    addStudent: builder.mutation<TStudent[], FormData>({
      query: (data) => ({
        url: '/users/create-student',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: TResponseRedux<TStudent[]>) => response.data ?? [],
      invalidatesTags: ['Students'],
    }),
    updateStudent: builder.mutation<TStudent, { id: string; data: unknown }>({
      query: ({ id, data }) => ({
        url: `/students/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: TResponseRedux<TStudent>) => response.data as TStudent,
      invalidatesTags: ['Students'],
    }),
    deleteStudent: builder.mutation<TStudent, string>({
      query: (id: string) => ({
        url: `/students/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: TResponseRedux<TStudent>) => response.data as TStudent,
      invalidatesTags: ['Students'],
    }),

    // Faculty endpoints
    getAllFaculties: builder.query<PaginatedUsers<TFaculty>, TQueryParam[] | undefined>({
      query: (args) => {
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
      transformResponse: (response: TResponseRedux<TFaculty[]>) => {
        return {
          data: response.data ?? [],
          meta: response.meta,
        };
      },
      providesTags: ['Faculties'],
    }),
    getSingleFaculty: builder.query<TFaculty, string>({
      query: (id: string) => ({
        url: `/faculties/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: TResponseRedux<TFaculty>) => response.data as TFaculty,
    }),
    addFaculty: builder.mutation<TFaculty[], FormData>({
      query: (data) => ({
        url: '/users/create-faculty',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: TResponseRedux<TFaculty[]>) => response.data ?? [],
      invalidatesTags: ['Faculties'],
    }),
    updateFaculty: builder.mutation<TFaculty, { id: string; data: unknown }>({
      query: ({ id, data }) => ({
        url: `/faculties/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: TResponseRedux<TFaculty>) => response.data as TFaculty,
      invalidatesTags: ['Faculties'],
    }),
    deleteFaculty: builder.mutation<TFaculty, string>({
      query: (id: string) => ({
        url: `/faculties/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: TResponseRedux<TFaculty>) => response.data as TFaculty,
      invalidatesTags: ['Faculties'],
    }),

    // Admin endpoints
    getAllAdmins: builder.query<PaginatedUsers<TAdmin>, TQueryParam[] | undefined>({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }

        return {
          url: '/admins',
          method: 'GET',
          params,
        };
      },
      transformResponse: (response: TResponseRedux<TAdmin[]>) => ({
        data: response.data ?? [],
        meta: response.meta,
      }),
      providesTags: ['Admins'],
    }),
    getSingleAdmin: builder.query<TAdmin, string>({
      query: (id: string) => ({
        url: `/admins/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: TResponseRedux<TAdmin>) => response.data as TAdmin,
    }),
    addAdmin: builder.mutation<TAdmin[], FormData>({
      query: (data) => ({
        url: '/users/create-admin',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: TResponseRedux<TAdmin[]>) => response.data ?? [],
      invalidatesTags: ['Admins'],
    }),
    updateAdmin: builder.mutation<TAdmin, { id: string; data: unknown }>({
      query: ({ id, data }) => ({
        url: `/admins/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: TResponseRedux<TAdmin>) => response.data as TAdmin,
      invalidatesTags: ['Admins'],
    }),
    deleteAdmin: builder.mutation<TAdmin, string>({
      query: (id: string) => ({
        url: `/admins/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: TResponseRedux<TAdmin>) => response.data as TAdmin,
      invalidatesTags: ['Admins'],
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
  useChangePasswordMutation,
} = userManagementApi;
