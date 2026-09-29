import { toQueryParams, toPage } from '../../api/api.utils';
import type { TPaginatedResponse, TResponse } from '../../../types';

import type { TSubmission } from '../../../types/submission.type';
import { baseApi } from '../../api/baseApi';

const submissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSubmission: builder.mutation<TResponse<unknown>, unknown>({
      query: (data) => ({
        url: '/submissions/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Submission'],
    }),
    replaceSubmission: builder.mutation<TResponse<unknown>, { id: string; file: File }>({
      query: ({ id, file }) => {
        const body = new FormData();
        body.append('file', file);
        return { url: `/submissions/${id}`, method: 'PATCH', body };
      },
      invalidatesTags: ['Submission'],
    }),
    getAllSubmissions: builder.query<TPaginatedResponse<TSubmission>, Record<string, string> | undefined>({
      query: (args) => ({
        url: '/submissions',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['Submission'],
      transformResponse: (response: TResponse<TSubmission[]>) => toPage(response),
    }),
    gradeSubmission: builder.mutation<
      TResponse<unknown>,
      { id: string; data: { grade: number; feedback?: string; correctionReason?: string } }
    >({
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
  useReplaceSubmissionMutation,
  useGetAllSubmissionsQuery,
  useGradeSubmissionMutation,
} = submissionApi;
