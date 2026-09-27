import { toQueryParams, toPage } from '../../api/api.utils';
import type { TPaginatedResponse, TQueryParam, TResponse } from '../../../types';

import { baseApi } from '../../api/baseApi';
import type { TOfferedCourse } from '../../../types/courseManagement.type';

export type FacultyEnrolledCourse = {
  _id: string;
  student: { _id: string; id: string; fullName: string };
  offeredCourse: { _id: string; section: number };
  semesterRegistration: { _id: string };
  course: { title: string };
  courseMarks: { classTest1: number; classTest2: number; midTerm: number; finalTerm: number };
  grade?: string;
};

const facultyCoursesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFacultyOfferings: builder.query<{ data: TOfferedCourse[] }, void>({
      async queryFn(_arg, _api, _options, fetchWithBQ) {
        const courses: TOfferedCourse[] = [];
        let page = 1;
        let hasNext = true;
        while (hasNext) {
          const response = await fetchWithBQ({ url: '/offered-courses', params: { page, limit: 100, sort: '_id' } });
          if (response.error) return { error: response.error };
          const result = response.data as TResponse<TOfferedCourse[]>;
          courses.push(...(result.data ?? []));
          hasNext = result.meta?.hasNext ?? false;
          page += 1;
        }
        return { data: { data: courses } };
      },
      providesTags: ['offeredCourse'],
    }),
    getFacultyCourses: builder.query<TPaginatedResponse<FacultyEnrolledCourse>, TQueryParam[] | undefined>({
      query: (args) => ({
        url: '/enrolled-courses',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['EnrolledCourse'],
      transformResponse: (response: TResponse<FacultyEnrolledCourse[]>) => toPage(response),
    }),
    updateEnrolledCourseMarks: builder.mutation<TResponse<unknown>, unknown>({
      query: (data) => ({
        url: '/enrolled-courses/update-enrolled-course-marks',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['EnrolledCourse'],
    }),
  }),
});

export const { useGetFacultyOfferingsQuery, useGetFacultyCoursesQuery, useUpdateEnrolledCourseMarksMutation } =
  facultyCoursesApi;
