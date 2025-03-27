const express = require("express");
const standingsRoutes = require("./standings");
const scheduleRoutes = require("./schedule");
const resultsRoutes = require("./results");
const cacheRoutes = require("./cache");

const router = express.Router();

// Root route
router.get("/", (req, res) => {
  res.json({ message: "F1 Data API Backend Running" });
});

// Mount sub-routes
router.use("/standings", standingsRoutes);
router.use("/schedule", scheduleRoutes);
router.use("/results", resultsRoutes);
router.use("/cache", cacheRoutes);

// Test route
router.get("/test-ergast", async (req, res, next) => {
  const { fetchFromErgast } = require("../utils/ergastApi");

  try {
    const result = await fetchFromErgast("/current/driverStandings.json");
    if (!result.success) {
      return res.status(result.error.status).json({
        error: "Failed to fetch data from Ergast API",
        message: result.error.message,
      });
    }

    res.json(result.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
