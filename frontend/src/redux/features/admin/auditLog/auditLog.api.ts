import { TMeta } from '../../../../types';
import { TAuditLog } from '../../../../types/auditLog.type';
import { baseApi } from '../../../api/baseApi';

type PaginatedAuditLogs = {
  data?: TAuditLog[];
  meta?: TMeta;
};

const auditLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<PaginatedAuditLogs, Record<string, string> | undefined>({
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
