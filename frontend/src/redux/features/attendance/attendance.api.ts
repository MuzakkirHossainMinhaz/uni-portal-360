import { TMeta, TResponseRedux } from '../../../types';
import { baseApi } from '../../api/baseApi';

type PaginatedResponse<T> = {
  data?: T;
  meta?: TMeta;
};

type AttendanceRecord = {
  _id: string;
  student: string;
  offeredCourse: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
};

type LowAttendanceStudent = {
  student: string;
  offeredCourse: string;
  percentage: number;
  studentDetails?: {
    id: string;
    fullName: string;
  };
  courseDetails?: {
    course: {
      title: string;
    };
  };
};

type AttendanceAnalytics = {
  totalAttendance: number;
};

const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAttendance: builder.mutation<AttendanceRecord, unknown>({
      query: (data) => ({
        url: '/attendance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    getMyAttendance: builder.query<PaginatedResponse<AttendanceRecord[]>, Record<string, string> | undefined>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          Object.keys(args).forEach((key) => {
            params.append(key, args[key]);
          });
        }
        return {
          url: '/attendance/my-attendance',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['Attendance'],
      transformResponse: (response: TResponseRedux<AttendanceRecord[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
    getAttendanceReport: builder.query<PaginatedResponse<AttendanceRecord[]>, Record<string, string> | undefined>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          Object.keys(args).forEach((key) => {
            params.append(key, args[key]);
          });
        }
        return {
          url: '/attendance/admin/report',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['Attendance'],
      transformResponse: (response: TResponseRedux<AttendanceRecord[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
    getLowAttendanceStudents: builder.query<PaginatedResponse<LowAttendanceStudent[]>, Record<string, string> | undefined>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          Object.keys(args).forEach((key) => {
            params.append(key, args[key]);
          });
        }
        return {
          url: '/attendance/admin/low-attendance',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['Attendance'],
      transformResponse: (response: TResponseRedux<LowAttendanceStudent[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
    getAttendanceAnalytics: builder.query<PaginatedResponse<AttendanceAnalytics>, void>({
      query: () => ({
        url: '/attendance/admin/analytics',
        method: 'GET',
      }),
      providesTags: ['Attendance'],
      transformResponse: (response: TResponseRedux<AttendanceAnalytics>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
  }),
});

export const {
  useCreateAttendanceMutation,
  useGetMyAttendanceQuery,
  useGetAttendanceReportQuery,
  useGetLowAttendanceStudentsQuery,
  useGetAttendanceAnalyticsQuery
} = attendanceApi;
