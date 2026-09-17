const mongoose = require("mongoose");
const { mongoUri } = require("./config");

async function run() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
    const dbName = mongoose.connection.db.databaseName;
    const cols = await mongoose.connection.db.listCollections().toArray();
    const names = cols.map((c) => c.name).sort();

    console.log("\nGlowify MongoDB — inspect");
    console.log("Connection uses database:", dbName);
    console.log("\nCollections (" + names.length + "):\n", names.join(", ") || "(none yet)");
    console.log("");

    if (names.includes("bookings")) {
      const bookings = mongoose.connection.db.collection("bookings");
      const total = await bookings.countDocuments();
      console.log(`bookings: ${total} document(s)`);
      const sample = await bookings
        .find({}, { projection: { date: 1, customerEmail: 1, status: 1 } })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
      if (sample.length) {
        console.log("\nLatest bookings (preview):");
        sample.forEach((b) => console.log(`  - ${b.date} | ${b.customerEmail || "?"} | ${b.status}`));
      }
    }

    console.log("\nTip: Install MongoDB Compass and connect using the same MONGODB_URI as server/.env\n");
  } catch (err) {
    console.error("Failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

run();
