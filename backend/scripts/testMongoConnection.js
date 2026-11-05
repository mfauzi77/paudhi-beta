#!/usr/bin/env node
/*
  Usage:
    node scripts/testMongoConnection.js --uri "mongodb+srv://user:pass@cluster/db?retryWrites=true&w=majority"
  or rely on env MONGODB_TEST_URI/MONGODB_URI
*/

const mongoose = require("mongoose");

function parseArgv(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return "";
}

async function main() {
  const uriFromArg = parseArgv("--uri");
  const uri = uriFromArg || process.env.MONGODB_TEST_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MongoDB URI not provided. Use --uri or set MONGODB_TEST_URI/MONGODB_URI");
    process.exit(1);
  }

  const startedAt = Date.now();
  let conn;
  try {
    conn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    }).asPromise();

    const admin = conn.db.admin();
    const ping = await admin.ping();
    const elapsedMs = Date.now() - startedAt;
    await conn.close();

    console.log("✅ MongoDB connection OK");
    console.log("⏱  Elapsed:", elapsedMs, "ms");
    console.log("📡 Ping:", ping);
    process.exit(0);
  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    if (conn) {
      try { await conn.close(); } catch (_) {}
    }
    console.error("❌ MongoDB connection FAILED");
    console.error("⏱  Elapsed:", elapsedMs, "ms");
    console.error("🧾 Error:", err && err.message ? err.message : String(err));
    console.error("🔖 Code:", err && (err.code || err.name));
    process.exit(2);
  }
}

main();



