import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Express middleware factory that validates the incoming request against a Zod schema.
 * Validates req.body, req.query, and req.params simultaneously.
 *
 * @param schema - A Zod schema that wraps `{ body, query, params }` sub-schemas.
 *
 * @example
 * import { createEscrowSchema } from '../validations/schemas';
 * router.post('/', protect, validateRequest(createEscrowSchema), createEscrow);
 */
const validateRequest = (schema: ZodSchema) => (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      res.status(400).json({ message: 'VALIDATION_ERROR', errors });
      return;
    }
    next(error);
  }
};

export default validateRequest;

// CommonJS interop — routes using require() still work
module.exports = validateRequest;
