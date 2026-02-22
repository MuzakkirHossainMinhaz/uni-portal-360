import { baseApi } from '../../api/baseApi';

const assignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAssignment: builder.mutation({
      query: (data) => ({
        url: '/assignments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assignment'],
    }),
    getAllAssignments: builder.query({
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
    }),
    getAssignmentById: builder.query({
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
