import { TMeta, TResponseRedux } from '../../../types';
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

type PaginatedSemesterResults = {
  data?: SemesterResult[];
  meta?: TMeta;
};

const semesterResultApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMySemesterResults: builder.query<PaginatedSemesterResults, Record<string, string> | undefined>({
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
      transformResponse: (response: TResponseRedux<SemesterResult[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
  }),
});

export const { useGetMySemesterResultsQuery } = semesterResultApi;
