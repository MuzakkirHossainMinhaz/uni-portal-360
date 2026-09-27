import { toQueryParams, toPage } from '../../api/api.utils';
import type { TPaginatedResponse, TResponse } from '../../../types';

import { baseApi } from '../../api/baseApi';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';
export type AttendanceSheetRow = {
  student: string;
  id: string;
  name: string;
  status: AttendanceStatus | null;
  remark: string;
};
type AttendanceRecord = {
  _id: string;
  student: string;
  offeredCourse: { course?: { title: string } } | null;
  date: string;
  status: AttendanceStatus;
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
  statusBreakdown: { _id: string; count: number }[];
};

const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFacultyAttendanceSheet: builder.query<{ data: AttendanceSheetRow[] }, { offeredCourse: string; date: string }>({
      query: (params) => ({ url: '/attendance/sheet', params }),
      providesTags: ['Attendance'],
    }),
    createAttendance: builder.mutation<TResponse<unknown>, unknown>({
      query: (data) => ({
        url: '/attendance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    getMyAttendance: builder.query<TPaginatedResponse<AttendanceRecord>, Record<string, string> | undefined>({
      query: (args) => ({
        url: '/attendance/my-attendance',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['Attendance'],
      transformResponse: (response: TResponse<AttendanceRecord[]>) => toPage(response),
    }),
    getAttendanceReport: builder.query<TPaginatedResponse<AttendanceRecord>, Record<string, string> | undefined>({
      query: (args) => ({
        url: '/attendance/admin/report',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['Attendance'],
      transformResponse: (response: TResponse<AttendanceRecord[]>) => toPage(response),
    }),
    getLowAttendanceStudents: builder.query<
      TPaginatedResponse<LowAttendanceStudent>,
      Record<string, string> | undefined
    >({
      query: (args) => ({
        url: '/attendance/admin/low-attendance',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['Attendance'],
      transformResponse: (response: TResponse<LowAttendanceStudent[]>) => toPage(response),
    }),
    getAttendanceAnalytics: builder.query<Pick<TResponse<AttendanceAnalytics>, 'data' | 'meta'>, void>({
      query: () => ({
        url: '/attendance/admin/analytics',
        method: 'GET',
      }),
      providesTags: ['Attendance'],
      transformResponse: (response: TResponse<AttendanceAnalytics>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
  }),
});

export const {
  useGetFacultyAttendanceSheetQuery,
  useCreateAttendanceMutation,
  useGetMyAttendanceQuery,
  useGetAttendanceReportQuery,
  useGetLowAttendanceStudentsQuery,
  useGetAttendanceAnalyticsQuery,
} = attendanceApi;
