import type { TGenericErrorResponse } from '../interface/error';
const handleDuplicateError = (err: {
  keyValue?: Record<string, unknown>;
  message?: string;
}): TGenericErrorResponse => ({
  statusCode: 409,
  message: 'A record with these details already exists',
  errorSources: [{ path: Object.keys(err.keyValue ?? {})[0] ?? '', message: 'This value must be unique' }],
});
export default handleDuplicateError;
