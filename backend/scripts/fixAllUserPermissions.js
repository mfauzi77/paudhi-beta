// scripts/fixAllUserPermissions.js
const mongoose = require("mongoose");
const User = require("../models/User");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/paudhi"; // Ganti jika perlu

async function migratePermissions() {
  await mongoose.connect(MONGO_URI);

  const users = await User.find({ permissions: { $type: "array" } });
  for (const user of users) {
    const perms = user.permissions;
    const newPerms = {
      ranPaud: { create: false, read: false, update: false, delete: false },
      news: { create: false, read: false, update: false, delete: false },
      pembelajaran: {
        create: false,
        read: false,
        update: false,
        delete: false,
      },
      faq: { create: false, read: false, update: false, delete: false },
      users: { create: false, read: false, update: false, delete: false },
    };
    perms.forEach((perm) => {
      let key = perm.module;
      if (key === "ran_paud") key = "ranPaud";
      if (newPerms[key]) {
        perm.actions.forEach((act) => {
          newPerms[key][act] = true;
        });
      }
    });
    user.permissions = newPerms;
    await user.save();
    console.log(`Migrated user: ${user.email}`);
  }
  console.log("Migration complete.");
  process.exit();
}

migratePermissions();
