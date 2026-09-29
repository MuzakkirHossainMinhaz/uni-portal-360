import { toQueryParams, toPage } from '../../api/api.utils';
import type { TPaginatedResponse, TResponse } from '../../../types';

import { baseApi } from '../../api/baseApi';

export type Assignment = {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  offeredCourse: { _id: string; section: number; course?: { title: string } };
};

const assignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAssignment: builder.mutation<
      TResponse<unknown>,
      { title: string; offeredCourse: string; description?: string; deadline?: string }
    >({
      query: (data) => ({
        url: '/assignments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assignment'],
    }),
    updateAssignment: builder.mutation<
      TResponse<unknown>,
      { id: string; data: { title?: string; description?: string; deadline?: string } }
    >({
      query: ({ id, data }) => ({ url: `/assignments/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Assignment'],
    }),
    deleteAssignment: builder.mutation<TResponse<unknown>, string>({
      query: (id) => ({ url: `/assignments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Assignment'],
    }),
    getAllAssignments: builder.query<TPaginatedResponse<Assignment>, Record<string, string> | undefined>({
      query: (args) => ({
        url: '/assignments',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['Assignment'],
      transformResponse: (response: TResponse<Assignment[]>) => toPage(response),
    }),
    getAssignmentById: builder.query<Assignment, string>({
      query: (id) => ({
        url: `/assignments/${id}`,
        method: 'GET',
      }),
      providesTags: ['Assignment'],
      transformResponse: (response: { data: Assignment }) => response.data,
    }),
  }),
});

export const {
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAllAssignmentsQuery,
  useGetAssignmentByIdQuery,
} = assignmentApi;
