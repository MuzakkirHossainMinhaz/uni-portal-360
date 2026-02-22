import { baseApi } from '../../api/baseApi';

const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => ({
        url: '/analytics/dashboard-stats',
        method: 'GET',
      }),
    }),
    getEnrollmentTrends: builder.query({
      query: (params) => ({
        url: '/analytics/enrollment-trends',
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetEnrollmentTrendsQuery } = analyticsApi;
