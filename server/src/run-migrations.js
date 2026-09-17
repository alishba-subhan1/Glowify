const mongoose = require("mongoose");
const { mongoUri } = require("./config");
const { runDataMigrations } = require("./utils/migrations");

async function run() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    await runDataMigrations();
    console.log("MongoDB migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

run();
