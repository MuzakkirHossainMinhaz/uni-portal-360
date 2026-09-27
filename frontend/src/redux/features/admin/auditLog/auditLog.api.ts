import { toQueryParams, toPage } from '../../../api/api.utils';
import type { TMeta, TPaginatedResponse } from '../../../../types';

import type { TAuditLog } from '../../../../types/auditLog.type';
import { baseApi } from '../../../api/baseApi';

const auditLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<TPaginatedResponse<TAuditLog>, Record<string, string> | undefined>({
      query: (args) => ({
        url: '/audit-logs',
        method: 'GET',
        params: toQueryParams(args),
      }),
      transformResponse: (response: { data?: TAuditLog[]; meta?: TMeta }) => toPage(response),
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditLogApi;
