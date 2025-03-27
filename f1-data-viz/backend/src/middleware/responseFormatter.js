/**
 * Middleware to format API responses consistently
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const responseFormatter = (req, res, next) => {
  // Store the original res.json method
  const originalJson = res.json;

  // Override the res.json method
  res.json = function (data) {
    // Check if the response is an error response (status >= 400)
    if (res.statusCode >= 400) {
      return originalJson.call(this, {
        success: false,
        error: data.error || true,
        message: data.message || "Error occurred",
        ...(data.details && { details: data.details }),
      });
    }

    // Format successful responses
    return originalJson.call(this, {
      success: true,
      data,
    });
  };

  // Continue to the next middleware
  next();
};

/**
 * Create a standardized success response
 * @param {object} res - Express response object
 * @param {object} data - Data to send in the response
 * @param {number} status - HTTP status code (default: 200)
 */
const sendSuccess = (res, data, status = 200) => {
  return res.status(status).json(data);
};

/**
 * Create a standardized error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 500)
 * @param {object} details - Additional error details
 */
const sendError = (res, message, status = 500, details = null) => {
  const errorResponse = {
    error: true,
    message,
  };

  if (details) {
    errorResponse.details = details;
  }

  return res.status(status).json(errorResponse);
};

module.exports = {
  responseFormatter,
  sendSuccess,
  sendError,
};
