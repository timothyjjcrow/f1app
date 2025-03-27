const express = require("express");
const { getRaceResults } = require("../utils/ergastApi");
const { sendError } = require("../middleware/responseFormatter");

const router = express.Router();

/**
 * @route   GET /api/results/:year/:round
 * @desc    Get race results for a specific year and round
 * @access  Public
 */
router.get("/:year/:round", async (req, res, next) => {
  try {
    const { year, round } = req.params;
    const result = await getRaceResults(year, round);

    if (!result.success) {
      return sendError(res, result.error.message, result.error.status);
    }

    res.json(result.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
