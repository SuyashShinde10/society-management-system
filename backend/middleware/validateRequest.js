const { ZodError } = require('zod');

const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues || error.errors || [];
      const errors = issues.map(err => ({
        path: err.path ? err.path.join('.') : '',
        message: err.message
      }));
      return res.status(400).json({ message: 'VALIDATION_ERROR', errors });
    }
    next(error);
  }
};

module.exports = validateRequest;
