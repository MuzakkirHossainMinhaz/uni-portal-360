import { baseApi } from '../../api/baseApi';

const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAttendance: builder.mutation({
      query: (data) => ({
        url: '/attendance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    getMyAttendance: builder.query({
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
    }),
    getAttendanceReport: builder.query({
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
    }),
    getLowAttendanceStudents: builder.query({
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
    }),
    getAttendanceAnalytics: builder.query({
        query: () => ({
            url: '/attendance/admin/analytics',
            method: 'GET'
        }),
        providesTags: ['Attendance']
    })
  }),
});

export const {
  useCreateAttendanceMutation,
  useGetMyAttendanceQuery,
  useGetAttendanceReportQuery,
  useGetLowAttendanceStudentsQuery,
  useGetAttendanceAnalyticsQuery
} = attendanceApi;
