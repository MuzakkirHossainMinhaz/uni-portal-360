import {
  TAcademicDepartment,
  TAcademicFaculty,
  TAcademicSemester,
  TMeta,
  TQueryParam,
  TResponseRedux,
} from '../../../types';
import { baseApi } from '../../api/baseApi';

type AcademicPage<T> = { data: T[]; meta?: TMeta };
type SemesterPayload = Pick<TAcademicSemester, 'name' | 'year' | 'code' | 'startMonth' | 'endMonth'>;
type FacultyPayload = Pick<TAcademicFaculty, 'name' | 'description'>;
type DepartmentPayload = { name: string; description?: string; academicFaculty: string };

const toQueryParams = (args?: TQueryParam[]) => {
  const params = new URLSearchParams();
  args?.forEach(({ name, value }) => params.append(name, String(value)));
  return params;
};

const toPage = <T>(response: TResponseRedux<T[]>): AcademicPage<T> => ({
  data: response.data ?? [],
  meta: response.meta,
});

export const academicManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Academic Semester endpoints
    getAllAcademicSemesters: builder.query<AcademicPage<TAcademicSemester>, TQueryParam[] | undefined>({
      query: (args) => ({
        url: '/academic-semesters',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['AcademicSemesters'],
      transformResponse: (response: TResponseRedux<TAcademicSemester[]>) => toPage(response),
    }),

    getSingleAcademicSemester: builder.query<TAcademicSemester | undefined, string>({
      query: (id: string) => ({
        url: `/academic-semesters/${id}`,
        method: 'GET',
      }),
      providesTags: ['AcademicSemesters'],
      transformResponse: (response: TResponseRedux<TAcademicSemester>) => response.data,
    }),

    createAcademicSemester: builder.mutation<unknown, SemesterPayload>({
      query: (data) => ({
        url: '/academic-semesters',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicSemesters'],
    }),

    updateAcademicSemester: builder.mutation<unknown, { id: string; data: Partial<SemesterPayload> }>({
      query: ({ id, data }) => ({
        url: `/academic-semesters/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AcademicSemesters'],
    }),

    deleteAcademicSemester: builder.mutation<unknown, string>({
      query: (id: string) => ({
        url: `/academic-semesters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AcademicSemesters'],
    }),

    // Academic Faculty endpoints
    getAllAcademicFaculties: builder.query<AcademicPage<TAcademicFaculty>, TQueryParam[] | undefined>({
      query: (args) => ({
        url: '/academic-faculties',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['AcademicFaculties'],
      transformResponse: (response: TResponseRedux<TAcademicFaculty[]>) => toPage(response),
    }),

    getSingleAcademicFaculty: builder.query<TAcademicFaculty | undefined, string>({
      query: (id: string) => ({
        url: `/academic-faculties/${id}`,
        method: 'GET',
      }),
      providesTags: ['AcademicFaculties'],
      transformResponse: (response: TResponseRedux<TAcademicFaculty>) => response.data,
    }),

    createAcademicFaculty: builder.mutation<unknown, FacultyPayload>({
      query: (data) => ({
        url: '/academic-faculties',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicFaculties'],
    }),

    updateAcademicFaculty: builder.mutation<unknown, { id: string; data: Partial<FacultyPayload> }>({
      query: ({ id, data }) => ({
        url: `/academic-faculties/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AcademicFaculties'],
    }),

    deleteAcademicFaculty: builder.mutation<unknown, string>({
      query: (id: string) => ({
        url: `/academic-faculties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AcademicFaculties'],
    }),

    // Academic Department endpoints
    getAllAcademicDepartments: builder.query<AcademicPage<TAcademicDepartment>, TQueryParam[] | undefined>({
      query: (args) => ({
        url: '/academic-departments',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['AcademicDepartments'],
      transformResponse: (response: TResponseRedux<TAcademicDepartment[]>) => toPage(response),
    }),

    getSingleAcademicDepartment: builder.query<TAcademicDepartment | undefined, string>({
      query: (id: string) => ({
        url: `/academic-departments/${id}`,
        method: 'GET',
      }),
      providesTags: ['AcademicDepartments'],
      transformResponse: (response: TResponseRedux<TAcademicDepartment>) => response.data,
    }),

    createAcademicDepartment: builder.mutation<unknown, DepartmentPayload>({
      query: (data) => ({
        url: '/academic-departments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicDepartments'],
    }),

    updateAcademicDepartment: builder.mutation<unknown, { id: string; data: Partial<DepartmentPayload> }>({
      query: ({ id, data }) => ({
        url: `/academic-departments/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AcademicDepartments'],
    }),

    deleteAcademicDepartment: builder.mutation<unknown, string>({
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
