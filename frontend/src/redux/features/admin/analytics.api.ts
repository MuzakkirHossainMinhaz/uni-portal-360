import { toPage } from '../../api/api.utils';
import type { TMeta, TPaginatedResponse, TResponse } from '../../../types';

import { baseApi } from '../../api/baseApi';

type DashboardStats = {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalEnrollments: number;
};

type EnrollmentTrendPoint = {
  _id: string;
  count: number;
};

type DashboardResponse = {
  data?: DashboardStats;
  meta?: TMeta;
};

const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardResponse, void>({
      query: () => ({
        url: '/analytics/dashboard-stats',
        method: 'GET',
      }),
      transformResponse: (response: TResponse<DashboardStats>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
    getEnrollmentTrends: builder.query<TPaginatedResponse<EnrollmentTrendPoint>, Record<string, string> | undefined>({
      query: (params) => ({
        url: '/analytics/enrollment-trends',
        method: 'GET',
        params,
      }),
      transformResponse: (response: TResponse<EnrollmentTrendPoint[]>) => toPage(response),
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetEnrollmentTrendsQuery } = analyticsApi;
