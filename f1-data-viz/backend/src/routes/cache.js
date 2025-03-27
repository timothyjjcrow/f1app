const express = require("express");
const { clearCache, getCacheStats } = require("../utils/ergastApi");
const { sendSuccess, sendError } = require("../middleware/responseFormatter");

const router = express.Router();

/**
 * @route   GET /api/cache/stats
 * @desc    Get cache statistics
 * @access  Public
 */
router.get("/stats", (req, res) => {
  try {
    const stats = getCacheStats();
    return sendSuccess(res, {
      timestamp: new Date().toISOString(),
      stats,
    });
  } catch (error) {
    return sendError(res, "Error retrieving cache stats", 500);
  }
});

/**
 * @route   POST /api/cache/clear
 * @desc    Clear the entire cache
 * @access  Public
 */
router.post("/clear", (req, res) => {
  try {
    clearCache();
    return sendSuccess(res, {
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return sendError(res, "Error clearing cache", 500);
  }
});

module.exports = router;
