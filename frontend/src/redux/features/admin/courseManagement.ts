import { TCourse, TCourseFaculty, TMeta, TQueryParam, TResponseRedux, TSemester } from '../../../types';
import { baseApi } from '../../api/baseApi';

type PaginatedSemesters = {
  data?: TSemester[];
  meta?: TMeta;
};

type PaginatedCourses = {
  data?: TCourse[];
  meta?: TMeta;
};

type CourseFacultiesResponse = {
  data?: TCourseFaculty;
  meta?: TMeta;
};

const courseManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllRegisteredSemesters: builder.query<PaginatedSemesters, TQueryParam[] | undefined>({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }

        return {
          url: '/semester-registrations',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['semester'],
      transformResponse: (response: TResponseRedux<TSemester[]>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    }),
    addRegisteredSemester: builder.mutation<TSemester, unknown>({
      query: (data) => ({
        url: '/semester-registrations/create-semester-registration',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['semester'],
    }),
    updateRegisteredSemester: builder.mutation<TSemester, { id: string; data: Partial<TSemester> }>({
      query: (args) => ({
        url: `/semester-registrations/${args.id}`,
        method: 'PATCH',
        body: args.data,
      }),
      invalidatesTags: ['semester'],
    }),
    getAllCourses: builder.query<PaginatedCourses, TQueryParam[] | undefined>({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }

        return {
          url: '/courses',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['courses'],
      transformResponse: (response: TResponseRedux<TCourse[]>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    }),
    addCourse: builder.mutation<TCourse, Partial<TCourse>>({
      query: (data) => ({
        url: `/courses/create-course`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['courses'],
    }),
    addFaculties: builder.mutation<TCourseFaculty, { courseId: string; data: string[] }>({
      query: (args) => ({
        url: `/courses/${args.courseId}/assign-faculties`,
        method: 'PUT',
        body: args.data,
      }),
      invalidatesTags: ['courses'],
    }),
    getCourseFaculties: builder.query<CourseFacultiesResponse, string>({
      query: (id) => {
        return {
          url: `/courses/${id}/get-faculties`,
          method: 'GET',
        };
      },
      transformResponse: (response: TResponseRedux<TCourseFaculty>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    }),
    createOfferedCourse: builder.mutation<unknown, unknown>({
      query: (data) => ({
        url: `offered-courses/create-offered-course`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['courses'],
    }),
  }),
});

export const {
  useAddRegisteredSemesterMutation,
  useGetAllRegisteredSemestersQuery,
  useUpdateRegisteredSemesterMutation,
  useGetAllCoursesQuery,
  useAddCourseMutation,
  useAddFacultiesMutation,
  useGetCourseFacultiesQuery,
  useCreateOfferedCourseMutation,
} = courseManagementApi;
