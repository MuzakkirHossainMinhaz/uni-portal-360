import { TMeta, TResponseRedux } from '../../../types';
import { baseApi } from '../../api/baseApi';

type Assignment = {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  course: string;
};

type PaginatedAssignments = {
  data?: Assignment[];
  meta?: TMeta;
};

const assignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAssignment: builder.mutation<Assignment, Partial<Assignment>>({
      query: (data) => ({
        url: '/assignments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assignment'],
    }),
    getAllAssignments: builder.query<PaginatedAssignments, Record<string, string> | undefined>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          Object.keys(args).forEach((key) => {
            params.append(key, args[key]);
          });
        }
        return {
          url: '/assignments',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['Assignment'],
      transformResponse: (response: TResponseRedux<Assignment[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),
    getAssignmentById: builder.query<Assignment, string>({
      query: (id) => ({
        url: `/assignments/${id}`,
        method: 'GET',
      }),
      providesTags: ['Assignment'],
    }),
  }),
});

export const {
  useCreateAssignmentMutation,
  useGetAllAssignmentsQuery,
  useGetAssignmentByIdQuery,
} = assignmentApi;
