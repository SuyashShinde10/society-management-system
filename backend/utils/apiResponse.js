/**
 * Standardized API Response Helper for Express Controllers
 */
class ApiResponse {
  /**
   * Send a successful JSON response
   */
  static success(res, data = null, message = 'Success', statusCode = 200, meta = null) {
    const payload = {
      success: true,
      message,
      data,
    };
    if (meta) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  /**
   * Send an error JSON response
   */
  static error(res, message = 'An error occurred', statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR', errors = null) {
    const payload = {
      success: false,
      message,
      errorCode,
    };
    if (errors) {
      payload.errors = errors;
    }
    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
