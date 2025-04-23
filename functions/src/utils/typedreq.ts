/*
 * All comments made in the file were done by OpenAI's o4-mini model
 *
 * This module exports a middleware factory for Express that validates
 * incoming request data (body, URL parameters, and query string).
 * The user can supply validator functions which should throw on invalid data.
 * If any validator throws, the middleware catches the error, logs it,
 * and responds with a 400 status including error details.
 */

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
  // Return an Express middleware that applies the provided validators
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body if a validator was provided
      if (body) {
        body(req.body);
      }
      // Validate URL parameters if a validator was provided
      if (params) {
        params(req.params);
      }
      // Validate query string if a validator was provided
      if (query) {
        query(req.query);
      }
      next();
    } catch (error: any) {
      console.error('Request validation failed:', error?.message);
      // Check if error matches the shape of a typical typia validation error
      const isTypiaError =
        typeof error === 'object' &&
        error !== null &&
        'path' in error &&
        'reason' in error;
      // Respond with HTTP 400 and include issues if available
      res.status(400).send({
        error: 'Invalid request data',
        issues: isTypiaError ? (error.errors ?? error.message) : undefined,
      });
    }
  };
};
