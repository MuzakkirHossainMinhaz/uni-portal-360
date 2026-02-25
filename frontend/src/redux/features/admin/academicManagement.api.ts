import { TResponseRedux } from '../../../types';
import { baseApi } from '../../api/baseApi';

export const academicManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Academic Semester endpoints
    getAllAcademicSemesters: builder.query({
      query: () => ({
        url: '/academic-semesters',
        method: 'GET',
      }),
      providesTags: ['AcademicSemesters'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    getSingleAcademicSemester: builder.query({
      query: (id: string) => ({
        url: `/academic-semesters/${id}`,
        method: 'GET',
      }),
      providesTags: ['AcademicSemesters'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    createAcademicSemester: builder.mutation({
      query: (data: any) => ({
        url: '/academic-semesters',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicSemesters'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    updateAcademicSemester: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/academic-semesters/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AcademicSemesters'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    deleteAcademicSemester: builder.mutation({
      query: (id: string) => ({
        url: `/academic-semesters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AcademicSemesters'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    // Academic Faculty endpoints
    getAllAcademicFaculties: builder.query({
      query: () => ({
        url: '/academic-faculties',
        method: 'GET',
      }),
      providesTags: ['AcademicFaculties'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    getSingleAcademicFaculty: builder.query({
      query: (id: string) => ({
        url: `/academic-faculties/${id}`,
        method: 'GET',
      }),
      providesTags: ['AcademicFaculties'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    createAcademicFaculty: builder.mutation({
      query: (data: any) => ({
        url: '/academic-faculties',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicFaculties'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    updateAcademicFaculty: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/academic-faculties/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AcademicFaculties'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    deleteAcademicFaculty: builder.mutation({
      query: (id: string) => ({
        url: `/academic-faculties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AcademicFaculties'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    // Academic Department endpoints
    getAllAcademicDepartments: builder.query({
      query: () => ({
        url: '/academic-departments',
        method: 'GET',
      }),
      providesTags: ['AcademicDepartments'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    getSingleAcademicDepartment: builder.query({
      query: (id: string) => ({
        url: `/academic-departments/${id}`,
        method: 'GET',
      }),
      providesTags: ['AcademicDepartments'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    createAcademicDepartment: builder.mutation({
      query: (data: any) => ({
        url: '/academic-departments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicDepartments'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    updateAcademicDepartment: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/academic-departments/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AcademicDepartments'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    deleteAcademicDepartment: builder.mutation({
      query: (id: string) => ({
        url: `/academic-departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AcademicDepartments'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
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
