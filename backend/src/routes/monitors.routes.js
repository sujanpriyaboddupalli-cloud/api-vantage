const express = require("express");
const Monitor = require("../models/Monitor");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const monitors = await Monitor.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(monitors.map((m) => m.toPublic()));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const monitor = await Monitor.findOne({ _id: req.params.id, owner: req.user._id });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });
    res.json(monitor.toPublic());
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, url, method, region, intervalSeconds, expectedStatusCode, timeoutMs } =
      req.body || {};
    if (!name || !url) return res.status(400).json({ message: "Name and URL are required" });

    const monitor = await Monitor.create({
      owner: req.user._id,
      name,
      url,
      method,
      region,
      intervalSeconds,
      expectedStatusCode,
      timeoutMs,
    });
    res.status(201).json(monitor.toPublic());
  } catch (err) {
    next(err);
  }
});

const EDITABLE = [
  "name",
  "url",
  "method",
  "region",
  "intervalSeconds",
  "expectedStatusCode",
  "timeoutMs",
  "paused",
];

router.put("/:id", async (req, res, next) => {
  try {
    const monitor = await Monitor.findOne({ _id: req.params.id, owner: req.user._id });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });

    for (const key of EDITABLE) {
      if (req.body?.[key] !== undefined) monitor[key] = req.body[key];
    }
    await monitor.save();
    res.json(monitor.toPublic());
  } catch (err) {
    next(err);
  }
});

router.post("/:id/pause", async (req, res, next) => {
  try {
    const monitor = await Monitor.findOne({ _id: req.params.id, owner: req.user._id });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });
    monitor.paused = !monitor.paused;
    monitor.consecutiveFailures = 0;
    await monitor.save();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await Monitor.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!deleted) return res.status(404).json({ message: "Monitor not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
