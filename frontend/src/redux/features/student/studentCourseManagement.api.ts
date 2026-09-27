import { toQueryParams, toPage } from '../../api/api.utils';
import type { TPaginatedResponse, TQueryParam, TResponse } from '../../../types';

import type { TOfferedCourse, TStudentEnrolledCourseSchedule } from '../../../types/studentCourse.type';
import { baseApi } from '../../api/baseApi';

const studentCourseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyOfferedCourses: builder.query<TPaginatedResponse<TOfferedCourse>, TQueryParam[] | undefined>({
      query: (args) => ({
        url: '/offered-courses/my-offered-courses',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['offeredCourse'],
      transformResponse: (response: TResponse<TOfferedCourse[]>) => toPage(response),
    }),
    getAllEnrolledCourses: builder.query<TPaginatedResponse<TStudentEnrolledCourseSchedule>, TQueryParam[] | undefined>(
      {
        query: (args) => ({
          url: '/enrolled-courses/my-enrolled-courses',
          method: 'GET',
          params: toQueryParams(args),
        }),
        providesTags: ['offeredCourse'],
        transformResponse: (response: TResponse<TStudentEnrolledCourseSchedule[]>) => toPage(response),
      },
    ),
    enrolCourse: builder.mutation<TResponse<unknown>, unknown>({
      query: (data) => ({
        url: '/enrolled-courses/create-enrolled-course',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['offeredCourse'],
    }),
  }),
});

export const { useGetMyOfferedCoursesQuery, useEnrolCourseMutation, useGetAllEnrolledCoursesQuery } = studentCourseApi;
