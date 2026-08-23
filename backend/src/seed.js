/**
 * Creates a demo user + a few monitors, then runs one check pass.
 * Usage: npm run seed   (login: demo@apisentinel.dev / password123)
 */
const mongoose = require("mongoose");
const config = require("./config");
const User = require("./models/User");
const Monitor = require("./models/Monitor");
const Incident = require("./models/Incident");
const { tick } = require("./checker");

async function main() {
  await mongoose.connect(config.mongoUri);

  await Promise.all([User.deleteMany({}), Monitor.deleteMany({}), Incident.deleteMany({})]);

  const user = await User.create({
    name: "Demo Engineer",
    email: "demo@apisentinel.dev",
    password: "password123",
    org: "Acme Platform",
    plan: "pro",
  });

  await Monitor.insertMany([
    {
      owner: user._id,
      name: "Public API",
      url: "https://httpbin.org/status/200",
      region: "us-east-1",
      intervalSeconds: 60,
    },
    {
      owner: user._id,
      name: "Docs site",
      url: "https://example.com",
      region: "eu-west-1",
      intervalSeconds: 120,
    },
    {
      owner: user._id,
      name: "Broken checkout",
      url: "https://httpbin.org/status/503",
      region: "us-west-2",
      intervalSeconds: 60,
    },
  ]);

  await tick();
  console.log("Seeded. Login with demo@apisentinel.dev / password123");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
