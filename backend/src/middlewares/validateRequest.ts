import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';
import catchAsync from '../utils/catchAsync';

const validateRequest = (schema: z.ZodTypeAny) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.parseAsync({
      body: req.body,
      cookies: req.cookies,
      query: req.query,
      params: req.params,
    });
    // Use validated values, including defaults, transforms and stripped fields.
    if (parsed && typeof parsed === 'object' && 'body' in parsed) {
      req.body = parsed.body;
    }

    next();
  });
};

export default validateRequest;
