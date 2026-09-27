import { toQueryParams, toPage } from '../../api/api.utils';
import type { TPaginatedResponse, TResponse } from '../../../types';

import { baseApi } from '../../api/baseApi';

type SemesterResult = {
  _id: string;
  academicSemester: {
    name: string;
    year: string;
  };
  totalCredits: number;
  gpa: number;
  completedCourses: string[];
};

const semesterResultApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMySemesterResults: builder.query<TPaginatedResponse<SemesterResult>, Record<string, string> | undefined>({
      query: (args) => ({
        url: '/semester-results/my-results',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['SemesterResult'],
      transformResponse: (response: TResponse<SemesterResult[]>) => toPage(response),
    }),
  }),
});

export const { useGetMySemesterResultsQuery } = semesterResultApi;
