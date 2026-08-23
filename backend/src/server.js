const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config");
const { startChecker } = require("./checker");

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log("[db] connected");

  app.listen(config.port, () => {
    console.log(`[api] listening on http://localhost:${config.port}/api`);
    startChecker();
  });
}

main().catch((err) => {
  console.error("[fatal]", err.message);
  process.exit(1);
});
