const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    state: {
      type: String,
      enum: ["investigating", "identified", "monitoring", "resolved"],
      default: "investigating",
    },
    author: { type: String, default: "API Sentinel" },
    message: { type: String, required: true },
  },
  { _id: true },
);

const incidentSchema = new mongoose.Schema(
  {
    monitor: { type: mongoose.Schema.Types.ObjectId, ref: "Monitor", required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    monitorName: { type: String, required: true },
    title: { type: String, required: true },
    severity: { type: String, enum: ["critical", "major", "minor"], default: "major" },
    status: { type: String, enum: ["open", "resolved"], default: "open", index: true },
    state: {
      type: String,
      enum: ["investigating", "identified", "monitoring", "resolved"],
      default: "investigating",
    },
    startedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
    affectedRegions: { type: [String], default: [] },
    rootCause: { type: String },
    timeline: { type: [eventSchema], default: [] },
  },
  { timestamps: true },
);

// Shape matches the frontend `Incident` type.
incidentSchema.methods.toPublic = function toPublic() {
  const end = this.resolvedAt || new Date();
  return {
    id: this._id.toString(),
    monitorId: this.monitor.toString(),
    monitorName: this.monitorName,
    title: this.title,
    severity: this.severity,
    state: this.state,
    status: this.status,
    startedAt: this.startedAt.toISOString(),
    resolvedAt: this.resolvedAt ? this.resolvedAt.toISOString() : null,
    durationMinutes: Math.max(1, Math.round((end - this.startedAt) / 60000)),
    affectedRegions: this.affectedRegions,
    ...(this.rootCause ? { rootCause: this.rootCause } : {}),
    timeline: this.timeline.map((e) => ({
      id: e._id.toString(),
      at: e.at.toISOString(),
      state: e.state,
      author: e.author,
      message: e.message,
    })),
  };
};

module.exports = mongoose.model("Incident", incidentSchema);
