import { TMeta, TResponseRedux } from '../../../types';
import { TSubmission } from '../../../types/submission.type';
import { baseApi } from '../../api/baseApi';

type PaginatedSubmissions = {
  data?: TSubmission[];
  meta?: TMeta;
};

const submissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSubmission: builder.mutation<TSubmission, unknown>({
      query: (data) => ({
        url: '/submissions/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Submission'],
    }),
    getAllSubmissions: builder.query<PaginatedSubmissions, Record<string, string> | undefined>({
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
      transformResponse: (response: TResponseRedux<TSubmission[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
    gradeSubmission: builder.mutation<TSubmission, { id: string; data: Partial<TSubmission> }>({
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
