import { TMeta, TResponseRedux } from '../../../types';
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
    getFacultyCourses: builder.query<PaginatedFacultyCourses, Record<string, string> | undefined>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          Object.keys(args).forEach((key) => {
            params.append(key, args[key]);
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
