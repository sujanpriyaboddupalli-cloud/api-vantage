const cron = require("node-cron");
const config = require("./config");
const Monitor = require("./models/Monitor");
const Incident = require("./models/Incident");
const User = require("./models/User");
const { sendDownAlert, sendRecoveredAlert } = require("./mailer");

const DEGRADED_MS = 1200;

async function runCheck(monitor) {
  const startedAt = Date.now();
  let ok = false;
  let statusCode = 0;
  let error = null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), monitor.timeoutMs);
    const res = await fetch(monitor.url, {
      method: monitor.method,
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);
    statusCode = res.status;
    ok = res.status === monitor.expectedStatusCode;
  } catch (err) {
    error = err.name === "AbortError" ? "Request timed out" : err.message;
  }

  const responseTimeMs = Date.now() - startedAt;

  monitor.lastCheckedAt = new Date();
  monitor.responseTimeMs = responseTimeMs;
  monitor.checksTotal += 1;
  monitor.latencySeries = [...monitor.latencySeries, responseTimeMs].slice(-48);

  if (ok) {
    monitor.consecutiveFailures = 0;
    monitor.status = responseTimeMs > DEGRADED_MS ? "degraded" : "up";
  } else {
    monitor.checksFailed += 1;
    monitor.consecutiveFailures += 1;
    monitor.status = "down";
  }

  await monitor.save();

  const reason = error || `Expected ${monitor.expectedStatusCode}, received ${statusCode}`;
  if (ok) await autoResolve(monitor, responseTimeMs);
  else await maybeOpenIncident(monitor, reason);
}

async function maybeOpenIncident(monitor, reason) {
  if (monitor.consecutiveFailures < config.failureThreshold) return;

  const open = await Incident.findOne({ monitor: monitor._id, status: "open" });
  if (open) {
    open.timeline.push({
      state: open.state,
      message: `Check still failing — ${reason} (failure #${monitor.consecutiveFailures}).`,
    });
    await open.save();
    return;
  }

  const owner = await User.findById(monitor.owner);
  await sendDownAlert({ email: monitor.alertEmail || owner?.email }, monitor, reason);

  await Incident.create({
    monitor: monitor._id,
    owner: monitor.owner,
    monitorName: monitor.name,
    title: `${monitor.name} is not responding as expected`,
    severity: "critical",
    status: "open",
    state: "investigating",
    startedAt: new Date(),
    affectedRegions: [monitor.region],
    timeline: [
      {
        state: "investigating",
        message: `Opened automatically after ${monitor.consecutiveFailures} consecutive failed checks — ${reason}.`,
      },
    ],
  });
}

async function autoResolve(monitor, responseTimeMs) {
  const open = await Incident.findOne({ monitor: monitor._id, status: "open" });
  if (!open) return;
  open.status = "resolved";
  open.state = "resolved";
  open.resolvedAt = new Date();
  open.timeline.push({
    state: "resolved",
    message: `Endpoint recovered — responded in ${responseTimeMs}ms. Auto-resolved.`,
  });
  await open.save();

  const owner = await User.findById(monitor.owner);
  const recipient = { email: monitor.alertEmail || owner?.email };
  const downMinutes = Math.max(1, Math.round((Date.now() - open.startedAt.getTime()) / 60000));
  await sendRecoveredAlert(recipient, monitor, responseTimeMs, downMinutes);
}

function isDue(monitor) {
  if (!monitor.lastCheckedAt) return true;
  return Date.now() - monitor.lastCheckedAt.getTime() >= monitor.intervalSeconds * 1000;
}

async function tick() {
  const monitors = await Monitor.find({ paused: false });
  const due = monitors.filter(isDue);
  await Promise.allSettled(due.map((m) => runCheck(m).catch(() => {})));
  if (due.length) console.log(`[checker] ran ${due.length} check(s)`);
}

function startChecker() {
  cron.schedule(config.checkCron, () => {
    tick().catch((err) => console.error("[checker]", err.message));
  });
  console.log(`[checker] scheduled "${config.checkCron}"`);
}

module.exports = { startChecker, tick, runCheck };
