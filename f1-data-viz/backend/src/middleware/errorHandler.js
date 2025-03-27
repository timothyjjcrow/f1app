/**
 * Global error handling middleware
 * @param {Error} err - The error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error("Error:", {
    path: req.path,
    method: req.method,
    message: err.message,
    stack: err.stack,
  });

  // Default error status and message
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  // Send the error response
  res.status(status).json({
    error: true,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

/**
 * Middleware to handle 404 errors
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: true,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
