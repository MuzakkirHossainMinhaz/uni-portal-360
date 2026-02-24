import {
  TAcademicDepartment,
  TAcademicFaculty,
  TAcademicSemester,
  TMeta,
  TQueryParam,
  TResponseRedux,
} from '../../../types';

import { baseApi } from '../../api/baseApi';

type PaginatedResponse<T> = {
  data?: T;
  meta?: TMeta;
};

const academicManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSemesters: builder.query<PaginatedResponse<TAcademicSemester[]>, TQueryParam[] | undefined>({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }

        return {
          url: '/academic-semesters',
          method: 'GET',
          params: params,
        };
      },
      transformResponse: (response: TResponseRedux<TAcademicSemester[]>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
      providesTags: ['AcademicSemesters'],
    }),
    addAcademicSemester: builder.mutation<unknown, unknown>({
      query: (data) => ({
        url: '/academic-semesters',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicSemesters'],
    }),
    updateAcademicSemester: builder.mutation<unknown, unknown>({
      query: (data) => ({
        url: '/academic-semesters',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AcademicSemesters'],
    }),
    deleteAcademicSemester: builder.mutation<unknown, unknown>({
      query: (data) => ({
        url: '/academic-semesters',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['AcademicSemesters'],
    }),
    getAcademicFaculties: builder.query<PaginatedResponse<TAcademicFaculty[]>, void>({
      query: () => {
        return { url: '/academic-faculties', method: 'GET' };
      },
      transformResponse: (response: TResponseRedux<TAcademicFaculty[]>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    }),
    addAcademicFaculty: builder.mutation<unknown, unknown>({
      query: (data) => ({
        url: '/academic-faculties/create-academic-faculty',
        method: 'POST',
        body: data,
      }),
    }),
    getAcademicDepartments: builder.query<PaginatedResponse<TAcademicDepartment[]>, void>({
      query: () => {
        return { url: '/academic-departments', method: 'GET' };
      },
      transformResponse: (response: TResponseRedux<TAcademicDepartment[]>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    }),
    addAcademicDepartment: builder.mutation<unknown, unknown>({
      query: (data) => ({
        url: '/academic-departments/create-academic-department',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAllSemestersQuery,
  useAddAcademicSemesterMutation,
  useUpdateAcademicSemesterMutation,
  useDeleteAcademicSemesterMutation,
  useGetAcademicDepartmentsQuery,
  useGetAcademicFacultiesQuery,
} = academicManagementApi;
