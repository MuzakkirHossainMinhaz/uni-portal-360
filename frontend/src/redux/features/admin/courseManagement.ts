import type { TCourse, TCourseFaculty, TMeta, TQueryParam, TResponseRedux, TSemester, TOfferedCourse } from '../../../types';
import { baseApi } from '../../api/baseApi';

type Page<T> = { data: T[]; meta?: TMeta };
type CoursePayload = Pick<TCourse, 'title' | 'prefix' | 'code' | 'credits' | 'preRequisiteCourses'>;
type SemesterPayload = Omit<Pick<TSemester, 'academicSemester' | 'status' | 'startDate' | 'endDate' | 'minCredit' | 'maxCredit'>, 'academicSemester'> & { academicSemester: string };
type OfferedPayload = { semesterRegistration: string; academicFaculty: string; academicDepartment: string; course: string; faculty: string; section: number; maxCapacity: number; days: string[]; startTime: string; endTime: string };

const paramsFor = (args?: TQueryParam[]) => {
  const params = new URLSearchParams();
  args?.forEach(({ name, value }) => params.append(name, String(value)));
  return params;
};
const pageFor = <T>(response: TResponseRedux<T[]>): Page<T> => ({ data: response.data ?? [], meta: response.meta });

export const courseManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllRegisteredSemesters: builder.query<Page<TSemester>, TQueryParam[] | undefined>({
      query: (args) => ({ url: '/semester-registrations', params: paramsFor(args) }),
      transformResponse: (response: TResponseRedux<TSemester[]>) => pageFor(response),
      providesTags: ['semester'],
    }),
    addRegisteredSemester: builder.mutation<unknown, SemesterPayload>({
      query: (body) => ({ url: '/semester-registrations/create-semester-registration', method: 'POST', body }),
      invalidatesTags: ['semester'],
    }),
    updateRegisteredSemester: builder.mutation<unknown, { id: string; data: Partial<SemesterPayload> }>({
      query: ({ id, data }) => ({ url: `/semester-registrations/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['semester'],
    }),
    deleteRegisteredSemester: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/semester-registrations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['semester', 'offeredCourse'],
    }),
    getAllCourses: builder.query<Page<TCourse>, TQueryParam[] | undefined>({
      query: (args) => ({ url: '/courses', params: paramsFor(args) }),
      transformResponse: (response: TResponseRedux<TCourse[]>) => pageFor(response),
      providesTags: ['courses'],
    }),
    addCourse: builder.mutation<unknown, CoursePayload>({
      query: (body) => ({ url: '/courses/create-course', method: 'POST', body }),
      invalidatesTags: ['courses'],
    }),
    updateCourse: builder.mutation<unknown, { id: string; data: CoursePayload }>({
      query: ({ id, data }) => ({ url: `/courses/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['courses', 'offeredCourse'],
    }),
    deleteCourse: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/courses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['courses'],
    }),
    addFaculties: builder.mutation<unknown, { courseId: string; data: string[] }>({
      query: ({ courseId, data }) => ({ url: `/courses/${courseId}/assign-faculties`, method: 'PUT', body: { faculties: data } }),
      invalidatesTags: ['courses'],
    }),
    removeFaculties: builder.mutation<unknown, { courseId: string; data: string[] }>({
      query: ({ courseId, data }) => ({ url: `/courses/${courseId}/remove-faculties`, method: 'DELETE', body: { faculties: data } }),
      invalidatesTags: ['courses'],
    }),
    getCourseFaculties: builder.query<TCourseFaculty | null, string>({
      query: (id) => ({ url: `/courses/${id}/get-faculties` }),
      transformResponse: (response: TResponseRedux<TCourseFaculty | null>) => response.data ?? null,
      providesTags: ['courses'],
    }),
    getAllOfferedCourses: builder.query<Page<TOfferedCourse>, TQueryParam[] | undefined>({
      query: (args) => ({ url: '/offered-courses', params: paramsFor(args) }),
      transformResponse: (response: TResponseRedux<TOfferedCourse[]>) => pageFor(response),
      providesTags: ['offeredCourse'],
    }),
    createOfferedCourse: builder.mutation<unknown, OfferedPayload>({
      query: (body) => ({ url: '/offered-courses/create-offered-course', method: 'POST', body }),
      invalidatesTags: ['offeredCourse'],
    }),
    updateOfferedCourse: builder.mutation<unknown, { id: string; data: Partial<Pick<OfferedPayload, 'faculty' | 'maxCapacity' | 'days' | 'startTime' | 'endTime'>> }>({
      query: ({ id, data }) => ({ url: `/offered-courses/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['offeredCourse'],
    }),
    deleteOfferedCourse: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/offered-courses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['offeredCourse'],
    }),
  }),
});

export const {
  useGetAllRegisteredSemestersQuery, useAddRegisteredSemesterMutation, useUpdateRegisteredSemesterMutation,
  useDeleteRegisteredSemesterMutation, useGetAllCoursesQuery, useAddCourseMutation, useUpdateCourseMutation,
  useDeleteCourseMutation, useAddFacultiesMutation, useRemoveFacultiesMutation, useGetCourseFacultiesQuery,
  useGetAllOfferedCoursesQuery, useCreateOfferedCourseMutation, useUpdateOfferedCourseMutation,
  useDeleteOfferedCourseMutation,
} = courseManagementApi;
