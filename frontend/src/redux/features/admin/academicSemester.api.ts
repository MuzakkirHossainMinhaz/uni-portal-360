import { TResponseRedux } from '../../../types';
import { baseApi } from '../../api/baseApi';

export const academicSemesterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET all academic semesters
    getAllAcademicSemesters: builder.query({
      query: () => ({
        url: '/academic-semesters',
        method: 'GET',
      }),
      providesTags: ['AcademicSemesters'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    // GET single academic semester
    getSingleAcademicSemester: builder.query({
      query: (id: string) => ({
        url: `/academic-semesters/${id}`,
        method: 'GET',
      }),
      providesTags: ['AcademicSemesters'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    // CREATE academic semester
    createAcademicSemester: builder.mutation({
      query: (data: any) => ({
        url: '/academic-semesters',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicSemesters'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    // UPDATE academic semester
    updateAcademicSemester: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/academic-semesters/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AcademicSemesters'],
      transformResponse: (response: TResponseRedux<any>) => response.data,
    }),

    // DELETE academic semester
    deleteAcademicSemester: builder.mutation({
      query: (id: string) => ({
        url: `/academic-semesters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AcademicSemesters'],
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
} = academicSemesterApi;
