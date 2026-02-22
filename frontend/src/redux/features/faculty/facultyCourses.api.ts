import { baseApi } from '../../api/baseApi';

const facultyCoursesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFacultyCourses: builder.query({
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
    }),
    updateEnrolledCourseMarks: builder.mutation({
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
