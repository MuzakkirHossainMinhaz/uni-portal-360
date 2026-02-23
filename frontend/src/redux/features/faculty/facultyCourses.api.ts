import { TMeta, TQueryParam, TResponseRedux } from '../../../types';
import { baseApi } from '../../api/baseApi';

type FacultyEnrolledCourse = {
  _id: string;
  student: string;
  offeredCourse: string;
  semesterRegistration: string;
  grade?: string;
};

type PaginatedFacultyCourses = {
  data?: FacultyEnrolledCourse[];
  meta?: TMeta;
};

const facultyCoursesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFacultyCourses: builder.query<PaginatedFacultyCourses, TQueryParam[] | undefined>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: TQueryParam) => {
            if (item.value !== undefined && item.value !== null) {
              params.append(item.name, String(item.value));
            }
          });
        }
        return {
          url: '/enrolled-courses',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['EnrolledCourse'],
      transformResponse: (response: TResponseRedux<FacultyEnrolledCourse[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
    updateEnrolledCourseMarks: builder.mutation<FacultyEnrolledCourse, unknown>({
      query: (data) => ({
        url: '/enrolled-courses/update-enrolled-course-marks',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['EnrolledCourse'],
    }),
  }),
});

export const { useGetFacultyCoursesQuery, useUpdateEnrolledCourseMarksMutation } = facultyCoursesApi;
