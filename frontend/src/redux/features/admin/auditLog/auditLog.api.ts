import { baseApi } from '../../../api/baseApi';

const auditLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          Object.keys(args).forEach((key) => {
            if (args[key]) {
              params.append(key, args[key]);
            }
          });
        }
        return {
          url: '/audit-logs',
          method: 'GET',
          params: params,
        };
      },
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditLogApi;
