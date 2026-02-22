import { baseApi } from '../../api/baseApi';

const feeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllFees: builder.query({
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
    }),
    getMyFees: builder.query({
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
    }),
    createFee: builder.mutation({
      query: (data) => ({
        url: '/fees',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Fee'],
    }),
    payFee: builder.mutation({
        query: ({ id, transactionId }) => ({
            url: `/fees/${id}/pay`,
            method: 'PATCH',
            body: { transactionId }
        }),
        invalidatesTags: ['Fee'],
    })
  }),
});

export const { useGetAllFeesQuery, useGetMyFeesQuery, useCreateFeeMutation, usePayFeeMutation } = feeApi;
