import { baseApi } from '../../api/baseApi';

const semesterResultApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMySemesterResults: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          Object.keys(args).forEach((key) => {
            params.append(key, args[key]);
          });
        }
        return {
          url: '/semester-results/my-results',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['SemesterResult'],
    }),
  }),
});

export const { useGetMySemesterResultsQuery } = semesterResultApi;
