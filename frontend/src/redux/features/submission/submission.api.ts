import { baseApi } from '../../api/baseApi';

const submissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSubmission: builder.mutation({
      query: (data) => ({
        url: '/submissions/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Submission'],
    }),
    getAllSubmissions: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          Object.keys(args).forEach((key) => {
            params.append(key, args[key]);
          });
        }
        return {
          url: '/submissions',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['Submission'],
    }),
    gradeSubmission: builder.mutation({
      query: ({ id, data }) => ({
        url: `/submissions/${id}/grade`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Submission'],
    }),
  }),
});

export const {
  useCreateSubmissionMutation,
  useGetAllSubmissionsQuery,
  useGradeSubmissionMutation,
} = submissionApi;
