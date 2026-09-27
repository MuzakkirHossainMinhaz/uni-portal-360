import { toQueryParams, toPage } from '../../api/api.utils';
import type { TPaginatedResponse, TResponse } from '../../../types';

import { baseApi } from '../../api/baseApi';

export type FeeStudent = {
  _id: string;
  id: string;
  fullName: string;
};

export type FeeSemester = {
  _id: string;
  name: string;
  year: string;
};

export type FeeItem = {
  _id: string;
  student: FeeStudent;
  academicSemester: FeeSemester;
  amount: number;
  type: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
  dueDate: string;
  description?: string;
  transactionId?: string;
  paidDate?: string;
};

export type CreateFeePayload = {
  student: string;
  academicSemester: string;
  type: string;
  amount: number;
  dueDate: string;
  description?: string;
};

const feeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllFees: builder.query<TPaginatedResponse<FeeItem>, Record<string, string> | undefined>({
      query: (args) => ({
        url: '/fees',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['Fee'],
      transformResponse: (response: TResponse<FeeItem[]>) => toPage(response),
    }),
    getMyFees: builder.query<TPaginatedResponse<FeeItem>, Record<string, string> | undefined>({
      query: (args) => ({
        url: '/fees/my-fees',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['Fee'],
      transformResponse: (response: TResponse<FeeItem[]>) => toPage(response),
    }),
    getMyFeeSummary: builder.query<{ unpaidAmount: number; unpaidCount: number }, void>({
      query: () => ({ url: '/fees/my-fees/summary' }),
      transformResponse: (response: TResponse<{ unpaidAmount: number; unpaidCount: number }>) =>
        response.data ?? { unpaidAmount: 0, unpaidCount: 0 },
      providesTags: ['Fee'],
    }),
    createFee: builder.mutation<TResponse<unknown>, CreateFeePayload>({
      query: (data) => ({
        url: '/fees',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Fee'],
    }),
    updateFee: builder.mutation<
      TResponse<unknown>,
      { id: string; data: Partial<Pick<CreateFeePayload, 'type' | 'amount' | 'dueDate' | 'description'>> }
    >({
      query: ({ id, data }) => ({ url: `/fees/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Fee'],
    }),
    deleteFee: builder.mutation<TResponse<unknown>, string>({
      query: (id) => ({ url: `/fees/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Fee'],
    }),
    payFee: builder.mutation<TResponse<unknown>, string>({
      query: (id) => ({
        url: `/fees/${id}/pay`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Fee'],
    }),
  }),
});

export const {
  useGetAllFeesQuery,
  useGetMyFeesQuery,
  useGetMyFeeSummaryQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
  usePayFeeMutation,
} = feeApi;
