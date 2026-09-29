import { toQueryParams, toPage } from '../../api/api.utils';
import type { TAdmin, TFaculty, TPaginatedResponse, TQueryParam, TResponse, TStudent } from '../../../types';

import { baseApi } from '../../api/baseApi';

const userManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFacultyOptions: builder.query<{ data: TFaculty[] }, void>({
      async queryFn(_arg, _api, _options, fetchWithBQ) {
        const data: TFaculty[] = [];
        let page = 1;
        let hasNext = true;
        while (hasNext) {
          const response = await fetchWithBQ({ url: '/faculties', params: { page, limit: 100, sort: '_id' } });
          if (response.error) return { error: response.error };
          const result = response.data as TResponse<TFaculty[]>;
          data.push(...(result.data ?? []));
          hasNext = result.meta?.hasNext ?? false;
          page += 1;
        }
        return { data: { data } };
      },
      providesTags: ['Faculties'],
    }),
    // Student endpoints
    getAllStudents: builder.query<TPaginatedResponse<TStudent>, TQueryParam[] | undefined>({
      query: (args) => ({
        url: '/students',
        method: 'GET',
        params: toQueryParams(args),
      }),
      transformResponse: (response: TResponse<TStudent[]>) => toPage(response),
      providesTags: ['Students'],
    }),
    getSingleStudent: builder.query<TStudent, string>({
      query: (id: string) => ({
        url: `/students/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: TResponse<TStudent>) => response.data as TStudent,
    }),
    addStudent: builder.mutation<TStudent[], FormData>({
      query: (data) => ({
        url: '/users/create-student',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: TResponse<TStudent[]>) => response.data ?? [],
      invalidatesTags: ['Students'],
    }),
    updateStudent: builder.mutation<TStudent, { id: string; data: unknown }>({
      query: ({ id, data }) => ({
        url: `/students/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: TResponse<TStudent>) => response.data as TStudent,
      invalidatesTags: ['Students'],
    }),
    deleteStudent: builder.mutation<TStudent, string>({
      query: (id: string) => ({
        url: `/students/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: TResponse<TStudent>) => response.data as TStudent,
      invalidatesTags: ['Students'],
    }),

    // Faculty endpoints
    getAllFaculties: builder.query<TPaginatedResponse<TFaculty>, TQueryParam[] | undefined>({
      query: (args) => ({
        url: '/faculties',
        method: 'GET',
        params: toQueryParams(args),
      }),
      transformResponse: (response: TResponse<TFaculty[]>) => toPage(response),
      providesTags: ['Faculties'],
    }),
    getSingleFaculty: builder.query<TFaculty, string>({
      query: (id: string) => ({
        url: `/faculties/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: TResponse<TFaculty>) => response.data as TFaculty,
    }),
    addFaculty: builder.mutation<TFaculty[], FormData>({
      query: (data) => ({
        url: '/users/create-faculty',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: TResponse<TFaculty[]>) => response.data ?? [],
      invalidatesTags: ['Faculties'],
    }),
    updateFaculty: builder.mutation<TFaculty, { id: string; data: unknown }>({
      query: ({ id, data }) => ({
        url: `/faculties/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: TResponse<TFaculty>) => response.data as TFaculty,
      invalidatesTags: ['Faculties'],
    }),
    deleteFaculty: builder.mutation<TFaculty, string>({
      query: (id: string) => ({
        url: `/faculties/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: TResponse<TFaculty>) => response.data as TFaculty,
      invalidatesTags: ['Faculties'],
    }),

    // Admin endpoints
    getAllAdmins: builder.query<TPaginatedResponse<TAdmin>, TQueryParam[] | undefined>({
      query: (args) => ({
        url: '/admins',
        method: 'GET',
        params: toQueryParams(args),
      }),
      transformResponse: (response: TResponse<TAdmin[]>) => toPage(response),
      providesTags: ['Admins'],
    }),
    getSingleAdmin: builder.query<TAdmin, string>({
      query: (id: string) => ({
        url: `/admins/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: TResponse<TAdmin>) => response.data as TAdmin,
    }),
    addAdmin: builder.mutation<TAdmin[], FormData>({
      query: (data) => ({
        url: '/users/create-admin',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: TResponse<TAdmin[]>) => response.data ?? [],
      invalidatesTags: ['Admins'],
    }),
    updateAdmin: builder.mutation<TAdmin, { id: string; data: unknown }>({
      query: ({ id, data }) => ({
        url: `/admins/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: TResponse<TAdmin>) => response.data as TAdmin,
      invalidatesTags: ['Admins'],
    }),
    deleteAdmin: builder.mutation<TAdmin, string>({
      query: (id: string) => ({
        url: `/admins/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: TResponse<TAdmin>) => response.data as TAdmin,
      invalidatesTags: ['Admins'],
    }),

    changePassword: builder.mutation<TResponse<unknown>, { oldPassword: string; newPassword: string }>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetFacultyOptionsQuery,
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
