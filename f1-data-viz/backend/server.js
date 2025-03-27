const express = require("express");
const cors = require("cors");
const apiRoutes = require("./src/routes/index");
const {
  errorHandler,
  notFoundHandler,
} = require("./src/middleware/errorHandler");
const { responseFormatter } = require("./src/middleware/responseFormatter");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(responseFormatter);

// Mount API routes
app.use("/api", apiRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "F1 Data API - Use /api for endpoints" });
});

// 404 handler - must be before other error handlers
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Available at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  // In a production environment, you might want to exit the process
  // process.exit(1);
});

module.exports = app; // For testing purposes
