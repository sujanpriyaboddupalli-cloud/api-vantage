const express = require("express");
const Monitor = require("../models/Monitor");
const Incident = require("../models/Incident");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return Math.round(sorted[idx]);
}

// Shape matches the frontend `OverviewStats` type.
router.get("/", async (req, res, next) => {
  try {
    const monitors = await Monitor.find({ owner: req.user._id });
    const active = monitors.filter((m) => !m.paused);

    const checksTotal = monitors.reduce((sum, m) => sum + m.checksTotal, 0);
    const checksFailed = monitors.reduce((sum, m) => sum + m.checksFailed, 0);
    const uptimePercent = checksTotal
      ? Number((((checksTotal - checksFailed) / checksTotal) * 100).toFixed(2))
      : 100;

    const latencies = active.map((m) => m.responseTimeMs).filter((v) => v > 0);
    const avgLatencyMs = latencies.length
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0;

    const activeIncidents = await Incident.countDocuments({
      owner: req.user._id,
      status: "open",
    });

    // build a 24-point series from each monitor's rolling latency history
    const depth = Math.max(0, ...active.map((m) => m.latencySeries.length));
    const points = Math.min(24, depth);
    const latencySeries = Array.from({ length: points }, (_, i) => {
      const offset = points - i;
      const slice = active
        .map((m) => m.latencySeries[m.latencySeries.length - offset])
        .filter((v) => typeof v === "number");
      return {
        t: new Date(Date.now() - offset * 60 * 60 * 1000).toISOString(),
        p50: percentile(slice, 50),
        p95: percentile(slice, 95),
      };
    });

    res.json({
      uptimePercent,
      uptimeTrend: 0,
      avgLatencyMs,
      latencyTrend: 0,
      activeIncidents,
      monitorsTotal: monitors.length,
      monitorsPaused: monitors.length - active.length,
      latencySeries,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
