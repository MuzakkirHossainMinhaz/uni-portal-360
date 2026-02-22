import { TMeta, TResponseRedux } from '../../../types';
import { baseApi } from '../../api/baseApi';

type FeeStudent = {
  _id: string;
  id: string;
  fullName: string;
};

type FeeSemester = {
  _id: string;
  name: string;
  year: string;
};

type AdminFeeItem = {
  _id: string;
  student: FeeStudent;
  academicSemester: FeeSemester;
  amount: number;
  type: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
};

type PaginatedFees = {
  data?: AdminFeeItem[];
  meta?: TMeta;
};

const feeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllFees: builder.query<PaginatedFees, Record<string, string> | undefined>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          Object.keys(args).forEach((key) => {
            if (args[key]) params.append(key, args[key]);
          });
        }
        return {
          url: '/fees',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['Fee'],
      transformResponse: (response: TResponseRedux<AdminFeeItem[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
    getMyFees: builder.query<PaginatedFees, Record<string, string> | undefined>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          Object.keys(args).forEach((key) => {
            if (args[key]) params.append(key, args[key]);
          });
        }
        return {
          url: '/fees/my-fees',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['Fee'],
      transformResponse: (response: TResponseRedux<AdminFeeItem[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
    createFee: builder.mutation<AdminFeeItem, Partial<AdminFeeItem>>({
      query: (data) => ({
        url: '/fees',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Fee'],
    }),
    payFee: builder.mutation<AdminFeeItem, { id: string; transactionId: string }>({
      query: ({ id, transactionId }) => ({
        url: `/fees/${id}/pay`,
        method: 'PATCH',
        body: { transactionId },
      }),
      invalidatesTags: ['Fee'],
    }),
  }),
});

export const { useGetAllFeesQuery, useGetMyFeesQuery, useCreateFeeMutation, usePayFeeMutation } = feeApi;
