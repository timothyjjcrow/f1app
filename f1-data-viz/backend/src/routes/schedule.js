const express = require("express");
const { getRaceSchedule } = require("../utils/ergastApi");
const { sendError } = require("../middleware/responseFormatter");

const router = express.Router();

/**
 * @route   GET /api/schedule/:year
 * @desc    Get race schedule for a specific year
 * @access  Public
 */
router.get("/:year", async (req, res, next) => {
  try {
    const { year } = req.params;
    const result = await getRaceSchedule(year);

    if (!result.success) {
      return sendError(res, result.error.message, result.error.status);
    }

    res.json(result.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
