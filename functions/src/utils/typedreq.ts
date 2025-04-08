import { NextFunction, Request, RequestHandler, Response } from 'express';

export interface ParamsDictionary {
  [key: string]: string;
}

export const validateRequest = ({
  body,
  params,
  query,
}: {
  body?: (input: unknown) => void;
  params?: (input: unknown) => void;
  query?: (input: unknown) => void;
}): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (body) {
        body(req.body);
      }
      if (params) {
        params(req.params);
      }
      if (query) {
        query(req.query);
      }
      next();
    } catch (error: any) {
      console.error('Request validation failed:', error?.message);
      const isTypiaError =
        typeof error === 'object' &&
        error !== null &&
        'path' in error &&
        'reason' in error;
      res.status(400).send({
        error: 'Invalid request data',
        issues: isTypiaError ? (error.errors ?? error.message) : undefined,
      });
    }
  };
};
