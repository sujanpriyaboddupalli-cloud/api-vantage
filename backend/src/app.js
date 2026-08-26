const express = require("express");
const cors = require("cors");
const config = require("./config");

const app = express();

app.use(
  cors({
    origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",").map((o) => o.trim()),
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/auth", require("./routes/auth.google"));
app.use("/api/monitors", require("./routes/monitors.routes"));
app.use("/api/incidents", require("./routes/incidents.routes"));
app.use("/api/overview", require("./routes/overview.routes"));

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || (err.name === "ValidationError" ? 400 : 500);
  res.status(status).json({ message: err.message || "Internal server error" });
});

module.exports = app;
