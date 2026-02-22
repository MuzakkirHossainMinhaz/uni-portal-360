import { TMeta, TQueryParam, TResponseRedux } from '../../../types';
import { TOfferedCourse, TStudentEnrolledCourseSchedule } from '../../../types/studentCourse.type';
import { baseApi } from '../../api/baseApi';

type PaginatedOfferedCourses = {
  data?: TOfferedCourse[];
  meta?: TMeta;
};

type PaginatedEnrolledCourses = {
  data?: TStudentEnrolledCourseSchedule[];
  meta?: TMeta;
};

const studentCourseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOfferedCourses: builder.query<PaginatedOfferedCourses, TQueryParam[] | undefined>({
      query: (args) => {
        console.log(args);
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }
        return {
          url: '/offered-courses/my-offered-courses',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['offeredCourse'],
      transformResponse: (response: TResponseRedux<TOfferedCourse[]>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    }),
    getAllEnrolledCourses: builder.query<PaginatedEnrolledCourses, TQueryParam[] | undefined>({
      query: (args) => {
        console.log(args);
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }
        return {
          url: '/enrolled-courses/my-enrolled-courses',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['offeredCourse'],
      transformResponse: (response: TResponseRedux<TStudentEnrolledCourseSchedule[]>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    }),
    enrolCourse: builder.mutation<unknown, unknown>({
      query: (data) => ({
        url: '/enrolled-courses/create-enrolled-course',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['offeredCourse'],
    }),
  }),
});

export const {
  useGetAllOfferedCoursesQuery,
  useEnrolCourseMutation,
  useGetAllEnrolledCoursesQuery,
} = studentCourseApi;
