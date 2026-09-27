export type TError = {
  data: {
    message: string;
    stack: string;
    success: boolean;
  };
  status: number;
};

export type TMeta = {
  limit: number;
  page: number;
  total: number;
  totalPages?: number;
  totalPage?: number;
  hasNext?: boolean;
};

export type TResponse<T> = {
  data?: T;
  error?: TError;
  meta?: TMeta;
  success: boolean;
  message: string;
};

export type TPaginatedResponse<T> = {
  data: T[];
  meta?: TMeta;
};

export type TQueryParam = {
  name: string;
  value: boolean | React.Key;
};
