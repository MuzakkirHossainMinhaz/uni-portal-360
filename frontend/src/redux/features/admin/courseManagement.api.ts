import { toQueryParams, toPage } from '../../api/api.utils';
import type {
  TCourse,
  TCourseFaculty,
  TPaginatedResponse,
  TQueryParam,
  TResponse,
  TSemester,
  TOfferedCourse,
} from '../../../types';
import { baseApi } from '../../api/baseApi';

type CoursePayload = Pick<TCourse, 'title' | 'prefix' | 'code' | 'credits' | 'preRequisiteCourses'>;
type SemesterPayload = Omit<
  Pick<TSemester, 'academicSemester' | 'status' | 'startDate' | 'endDate' | 'minCredit' | 'maxCredit'>,
  'academicSemester'
> & { academicSemester: string };
type OfferedPayload = {
  semesterRegistration: string;
  academicFaculty: string;
  academicDepartment: string;
  course: string;
  faculty: string;
  section: number;
  maxCapacity: number;
  days: string[];
  startTime: string;
  endTime: string;
};

export const courseManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllRegisteredSemesters: builder.query<TPaginatedResponse<TSemester>, TQueryParam[] | undefined>({
      query: (args) => ({ url: '/semester-registrations', params: toQueryParams(args) }),
      transformResponse: (response: TResponse<TSemester[]>) => toPage(response),
      providesTags: ['semester'],
    }),
    addRegisteredSemester: builder.mutation<TResponse<unknown>, SemesterPayload>({
      query: (body) => ({ url: '/semester-registrations/create-semester-registration', method: 'POST', body }),
      invalidatesTags: ['semester'],
    }),
    updateRegisteredSemester: builder.mutation<TResponse<unknown>, { id: string; data: Partial<SemesterPayload> }>({
      query: ({ id, data }) => ({ url: `/semester-registrations/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['semester'],
    }),
    deleteRegisteredSemester: builder.mutation<TResponse<unknown>, string>({
      query: (id) => ({ url: `/semester-registrations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['semester', 'offeredCourse'],
    }),
    getAllCourses: builder.query<TPaginatedResponse<TCourse>, TQueryParam[] | undefined>({
      query: (args) => ({ url: '/courses', params: toQueryParams(args) }),
      transformResponse: (response: TResponse<TCourse[]>) => toPage(response),
      providesTags: ['courses'],
    }),
    addCourse: builder.mutation<TResponse<unknown>, CoursePayload>({
      query: (body) => ({ url: '/courses/create-course', method: 'POST', body }),
      invalidatesTags: ['courses'],
    }),
    updateCourse: builder.mutation<TResponse<unknown>, { id: string; data: CoursePayload }>({
      query: ({ id, data }) => ({ url: `/courses/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['courses', 'offeredCourse'],
    }),
    deleteCourse: builder.mutation<TResponse<unknown>, string>({
      query: (id) => ({ url: `/courses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['courses'],
    }),
    addFaculties: builder.mutation<TResponse<unknown>, { courseId: string; data: string[] }>({
      query: ({ courseId, data }) => ({
        url: `/courses/${courseId}/assign-faculties`,
        method: 'PUT',
        body: { faculties: data },
      }),
      invalidatesTags: ['courses'],
    }),
    removeFaculties: builder.mutation<TResponse<unknown>, { courseId: string; data: string[] }>({
      query: ({ courseId, data }) => ({
        url: `/courses/${courseId}/remove-faculties`,
        method: 'DELETE',
        body: { faculties: data },
      }),
      invalidatesTags: ['courses'],
    }),
    getCourseFaculties: builder.query<TCourseFaculty | null, string>({
      query: (id) => ({ url: `/courses/${id}/get-faculties` }),
      transformResponse: (response: TResponse<TCourseFaculty | null>) => response.data ?? null,
      providesTags: ['courses'],
    }),
    getAllOfferedCourses: builder.query<TPaginatedResponse<TOfferedCourse>, TQueryParam[] | undefined>({
      query: (args) => ({ url: '/offered-courses', params: toQueryParams(args) }),
      transformResponse: (response: TResponse<TOfferedCourse[]>) => toPage(response),
      providesTags: ['offeredCourse'],
    }),
    createOfferedCourse: builder.mutation<TResponse<unknown>, OfferedPayload>({
      query: (body) => ({ url: '/offered-courses/create-offered-course', method: 'POST', body }),
      invalidatesTags: ['offeredCourse'],
    }),
    updateOfferedCourse: builder.mutation<
      TResponse<unknown>,
      { id: string; data: Partial<Pick<OfferedPayload, 'faculty' | 'maxCapacity' | 'days' | 'startTime' | 'endTime'>> }
    >({
      query: ({ id, data }) => ({ url: `/offered-courses/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['offeredCourse'],
    }),
    deleteOfferedCourse: builder.mutation<TResponse<unknown>, string>({
      query: (id) => ({ url: `/offered-courses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['offeredCourse'],
    }),
  }),
});

export const {
  useGetAllRegisteredSemestersQuery,
  useAddRegisteredSemesterMutation,
  useUpdateRegisteredSemesterMutation,
  useDeleteRegisteredSemesterMutation,
  useGetAllCoursesQuery,
  useAddCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useAddFacultiesMutation,
  useRemoveFacultiesMutation,
  useGetCourseFacultiesQuery,
  useGetAllOfferedCoursesQuery,
  useCreateOfferedCourseMutation,
  useUpdateOfferedCourseMutation,
  useDeleteOfferedCourseMutation,
} = courseManagementApi;
