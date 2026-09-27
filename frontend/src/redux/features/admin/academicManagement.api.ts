import { toQueryParams, toPage } from '../../api/api.utils';
import type {
  TAcademicDepartment,
  TAcademicFaculty,
  TAcademicSemester,
  TPaginatedResponse,
  TQueryParam,
  TResponse,
} from '../../../types';
import { baseApi } from '../../api/baseApi';

type SemesterPayload = Pick<TAcademicSemester, 'name' | 'year' | 'code' | 'startMonth' | 'endMonth'>;
type FacultyPayload = Pick<TAcademicFaculty, 'name' | 'description'>;
type DepartmentPayload = { name: string; description?: string; academicFaculty: string };

export const academicManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Academic Semester endpoints
    getAllAcademicSemesters: builder.query<TPaginatedResponse<TAcademicSemester>, TQueryParam[] | undefined>({
      query: (args) => ({
        url: '/academic-semesters',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['AcademicSemesters'],
      transformResponse: (response: TResponse<TAcademicSemester[]>) => toPage(response),
    }),

    getSingleAcademicSemester: builder.query<TAcademicSemester | undefined, string>({
      query: (id: string) => ({
        url: `/academic-semesters/${id}`,
        method: 'GET',
      }),
      providesTags: ['AcademicSemesters'],
      transformResponse: (response: TResponse<TAcademicSemester>) => response.data,
    }),

    createAcademicSemester: builder.mutation<TResponse<unknown>, SemesterPayload>({
      query: (data) => ({
        url: '/academic-semesters',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicSemesters'],
    }),

    updateAcademicSemester: builder.mutation<TResponse<unknown>, { id: string; data: Partial<SemesterPayload> }>({
      query: ({ id, data }) => ({
        url: `/academic-semesters/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AcademicSemesters'],
    }),

    deleteAcademicSemester: builder.mutation<TResponse<unknown>, string>({
      query: (id: string) => ({
        url: `/academic-semesters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AcademicSemesters'],
    }),

    // Academic Faculty endpoints
    getAllAcademicFaculties: builder.query<TPaginatedResponse<TAcademicFaculty>, TQueryParam[] | undefined>({
      query: (args) => ({
        url: '/academic-faculties',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['AcademicFaculties'],
      transformResponse: (response: TResponse<TAcademicFaculty[]>) => toPage(response),
    }),

    getSingleAcademicFaculty: builder.query<TAcademicFaculty | undefined, string>({
      query: (id: string) => ({
        url: `/academic-faculties/${id}`,
        method: 'GET',
      }),
      providesTags: ['AcademicFaculties'],
      transformResponse: (response: TResponse<TAcademicFaculty>) => response.data,
    }),

    createAcademicFaculty: builder.mutation<TResponse<unknown>, FacultyPayload>({
      query: (data) => ({
        url: '/academic-faculties',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicFaculties'],
    }),

    updateAcademicFaculty: builder.mutation<TResponse<unknown>, { id: string; data: Partial<FacultyPayload> }>({
      query: ({ id, data }) => ({
        url: `/academic-faculties/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AcademicFaculties'],
    }),

    deleteAcademicFaculty: builder.mutation<TResponse<unknown>, string>({
      query: (id: string) => ({
        url: `/academic-faculties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AcademicFaculties'],
    }),

    // Academic Department endpoints
    getAllAcademicDepartments: builder.query<TPaginatedResponse<TAcademicDepartment>, TQueryParam[] | undefined>({
      query: (args) => ({
        url: '/academic-departments',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['AcademicDepartments'],
      transformResponse: (response: TResponse<TAcademicDepartment[]>) => toPage(response),
    }),

    getSingleAcademicDepartment: builder.query<TAcademicDepartment | undefined, string>({
      query: (id: string) => ({
        url: `/academic-departments/${id}`,
        method: 'GET',
      }),
      providesTags: ['AcademicDepartments'],
      transformResponse: (response: TResponse<TAcademicDepartment>) => response.data,
    }),

    createAcademicDepartment: builder.mutation<TResponse<unknown>, DepartmentPayload>({
      query: (data) => ({
        url: '/academic-departments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicDepartments'],
    }),

    updateAcademicDepartment: builder.mutation<TResponse<unknown>, { id: string; data: Partial<DepartmentPayload> }>({
      query: ({ id, data }) => ({
        url: `/academic-departments/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AcademicDepartments'],
    }),

    deleteAcademicDepartment: builder.mutation<TResponse<unknown>, string>({
      query: (id: string) => ({
        url: `/academic-departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AcademicDepartments'],
    }),
  }),
});

export const {
  useGetAllAcademicSemestersQuery,
  useGetSingleAcademicSemesterQuery,
  useCreateAcademicSemesterMutation,
  useUpdateAcademicSemesterMutation,
  useDeleteAcademicSemesterMutation,
  useGetAllAcademicFacultiesQuery,
  useGetSingleAcademicFacultyQuery,
  useCreateAcademicFacultyMutation,
  useUpdateAcademicFacultyMutation,
  useDeleteAcademicFacultyMutation,
  useGetAllAcademicDepartmentsQuery,
  useGetSingleAcademicDepartmentQuery,
  useCreateAcademicDepartmentMutation,
  useUpdateAcademicDepartmentMutation,
  useDeleteAcademicDepartmentMutation,
} = academicManagementApi;
