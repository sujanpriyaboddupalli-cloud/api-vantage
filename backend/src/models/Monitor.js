const mongoose = require("mongoose");

const monitorSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    method: { type: String, enum: ["GET", "POST", "HEAD"], default: "GET" },
    region: { type: String, default: "us-east-1" },
    intervalSeconds: { type: Number, default: 60, min: 30 },
    expectedStatusCode: { type: Number, default: 200 },
    timeoutMs: { type: Number, default: 10000 },
    paused: { type: Boolean, default: false },

    // runtime state written by the scheduled checker
    status: { type: String, enum: ["up", "degraded", "down", "paused"], default: "up" },
    responseTimeMs: { type: Number, default: 0 },
    lastCheckedAt: { type: Date, default: null },
    consecutiveFailures: { type: Number, default: 0 },
    checksTotal: { type: Number, default: 0 },
    checksFailed: { type: Number, default: 0 },
    latencySeries: { type: [Number], default: [] },
  },
  { timestamps: true },
);

monitorSchema.methods.uptime30d = function uptime30d() {
  if (!this.checksTotal) return 100;
  return Number((((this.checksTotal - this.checksFailed) / this.checksTotal) * 100).toFixed(2));
};

// Shape matches the frontend `Monitor` type.
monitorSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    name: this.name,
    url: this.url,
    method: this.method,
    region: this.region,
    intervalSeconds: this.intervalSeconds,
    expectedStatusCode: this.expectedStatusCode,
    status: this.paused ? "paused" : this.status,
    responseTimeMs: this.responseTimeMs,
    uptime30d: this.uptime30d(),
    lastCheckedAt: (this.lastCheckedAt || this.createdAt).toISOString(),
    latencySeries: this.latencySeries.slice(-24),
  };
};

module.exports = mongoose.model("Monitor", monitorSchema);
