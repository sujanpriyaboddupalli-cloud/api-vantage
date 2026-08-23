const express = require("express");
const Incident = require("../models/Incident");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const filter = { owner: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const incidents = await Incident.find(filter).sort({ startedAt: -1 }).limit(100);
    res.json(incidents.map((i) => i.toPublic()));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const incident = await Incident.findOne({ _id: req.params.id, owner: req.user._id });
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    res.json(incident.toPublic());
  } catch (err) {
    next(err);
  }
});

router.post("/:id/resolve", async (req, res, next) => {
  try {
    const incident = await Incident.findOne({ _id: req.params.id, owner: req.user._id });
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    incident.status = "resolved";
    incident.state = "resolved";
    incident.resolvedAt = new Date();
    incident.timeline.push({
      state: "resolved",
      author: req.user.name,
      message: req.body?.message || "Incident manually resolved.",
    });
    await incident.save();
    res.json(incident.toPublic());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
