import { TMeta, TResponseRedux } from '../../../types';
import { baseApi } from '../../api/baseApi';

type DashboardStats = {
  totalStudents: number;
  totalFaculties: number;
  totalCourses: number;
  totalEnrollments: number;
};

type EnrollmentTrendPoint = {
  date: string;
  count: number;
};

type DashboardResponse = {
  data?: DashboardStats;
  meta?: TMeta;
};

type EnrollmentTrendsResponse = {
  data?: EnrollmentTrendPoint[];
  meta?: TMeta;
};

const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardResponse, void>({
      query: () => ({
        url: '/analytics/dashboard-stats',
        method: 'GET',
      }),
      transformResponse: (response: TResponseRedux<DashboardStats>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
    getEnrollmentTrends: builder.query<EnrollmentTrendsResponse, Record<string, string> | undefined>({
      query: (params) => ({
        url: '/analytics/enrollment-trends',
        method: 'GET',
        params,
      }),
      transformResponse: (response: TResponseRedux<EnrollmentTrendPoint[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetEnrollmentTrendsQuery } = analyticsApi;
