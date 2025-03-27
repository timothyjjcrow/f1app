const express = require("express");
const { getDriverStandings } = require("../utils/ergastApi");
const { sendError } = require("../middleware/responseFormatter");

const router = express.Router();

/**
 * @route   GET /api/standings/:year
 * @desc    Get driver standings for a specific year
 * @access  Public
 */
router.get("/:year", async (req, res, next) => {
  try {
    const { year } = req.params;
    const result = await getDriverStandings(year);

    if (!result.success) {
      return sendError(res, result.error.message, result.error.status);
    }

    res.json(result.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
