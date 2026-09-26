import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import auth, { authForPasswordChange } from '../../../middlewares/auth';
import globalErrorHandler from '../../../middlewares/globalErrorhandler';
import { User } from '../user.model';
import { USER_ROLE } from '../user.constant';

jest.mock('jsonwebtoken', () => ({ __esModule: true, default: { verify: jest.fn() } }));
jest.mock('../user.model', () => ({ User: { isUserExistsByCustomId: jest.fn() } }));

describe('authentication rules', () => {
  const request = { headers: { authorization: 'token' } } as Request;
  const response = {} as Response;

  const run = (handler: RequestHandler) =>
    new Promise<unknown>((resolve) => handler(request, response, ((error?: unknown) => resolve(error ?? null)) as NextFunction));

  beforeEach(() => {
    jest.clearAllMocks();
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 'A-0001', role: 'admin', iat: 1 });
    (User.isUserExistsByCustomId as jest.Mock).mockResolvedValue({
      id: 'A-0001', role: 'admin', status: 'in-progress', isDeleted: false, needsPasswordChange: true,
    });
  });

  it('requires the first password change on ordinary protected routes', async () => {
    await expect(run(auth(USER_ROLE.admin))).resolves.toMatchObject({
      statusCode: 403,
      message: 'Password change required',
    });
    await expect(run(authForPasswordChange(USER_ROLE.admin))).resolves.toBeNull();
  });

  it('returns forbidden, not an expired-session response, for a valid user with the wrong role', async () => {
    (User.isUserExistsByCustomId as jest.Mock).mockResolvedValue({
      id: 'A-0001', role: 'admin', status: 'in-progress', isDeleted: false, needsPasswordChange: false,
    });
    await expect(run(auth(USER_ROLE.superAdmin))).resolves.toMatchObject({ statusCode: 403 });
  });

  it('maps an expired JWT to HTTP 401', async () => {
    const error = Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
    (jwt.verify as jest.Mock).mockImplementation(() => { throw error; });
    const caught = await run(auth(USER_ROLE.admin));
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    globalErrorHandler(caught, { method: 'GET', originalUrl: '/api/v1/users/me' } as Request,
      { status } as unknown as Response, jest.fn());

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Your session is invalid or expired' }));
  });
});
