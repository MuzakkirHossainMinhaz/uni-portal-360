import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'sonner';
import { logout, requirePasswordChange } from '../features/auth/authSlice';
import { RootState } from '../store';

type ErrorWithMessage = {
  data?: {
    message?: string;
  };
};

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_SERVER_URL}`,
  credentials: 'include',
  timeout: 15_000,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set('authorization', `${token}`);
    }

    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<FetchArgs, unknown, unknown> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 404) {
    const error = result.error as ErrorWithMessage;
    toast.error(error.data?.message ?? 'Resource not found');
  }
  if (result?.error?.status === 403) {
    const error = result.error as ErrorWithMessage;
    if (error.data?.message === 'Password change required') {
      api.dispatch(requirePasswordChange());
      toast.error('Please change your password to continue.', { id: 'password-change-required' });
    } else {
      toast.error(error.data?.message ?? 'You are not authorized');
    }
  }
  if (result?.error?.status === 401) {
    api.dispatch(logout());
    toast.error('Your session has expired. Please log in again.', {
      id: 'session-expired',
    });
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'AcademicSemesters',
    'AcademicFaculties',
    'AcademicDepartments',
    'semester',
    'courses',
    'offeredCourse',
    'EnrolledCourse',
    'Assignment',
    'Attendance',
    'Fee',
    'Notification',
    'SemesterResult',
    'Submission',
    'Students',
    'Faculties',
    'Admins',
  ],
  endpoints: () => ({}),
});
