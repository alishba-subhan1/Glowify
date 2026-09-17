const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Setting = require("../models/Setting");
const Service = require("../models/Service");
const User = require("../models/User");
const Category = require("../models/Category");
const Translation = require("../models/Translation");
const { runDataMigrations } = require("./migrations");
const { defaultAdminEmail, defaultAdminPassword } = require("../config");

const starterServices = [
  {
    title: "Classic Haircut",
    name: "Classic Haircut",
    category: "Haircut",
    description: "Professional haircut with wash and basic styling.",
    duration: 45,
    durationMinutes: 45,
    price: 1200
  },
  {
    title: "Glow Facial",
    name: "Glow Facial",
    category: "Facial",
    description: "Deep cleansing facial for soft and fresh skin.",
    duration: 60,
    durationMinutes: 60,
    price: 2200
  },
  {
    title: "Party Makeup",
    name: "Party Makeup",
    category: "Makeup",
    description: "Event-ready makeup with customized look.",
    duration: 75,
    durationMinutes: 75,
    price: 3500
  },
  {
    title: "Bridal Package",
    name: "Bridal Package",
    category: "Bridal",
    description: "Complete bridal makeover package for special day.",
    duration: 180,
    durationMinutes: 180,
    price: 15000
  }
];

async function bootstrapDefaults() {
  const normalizedAdminEmail = defaultAdminEmail.toLowerCase();
  const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);

  const legacyUserAdmins = await User.find({ role: "admin", email: "admin@glowify.com" });
  for (const legacy of legacyUserAdmins) {
    const takenByOther = await User.findOne({
      email: normalizedAdminEmail,
      _id: { $ne: legacy._id }
    });
    if (takenByOther) {
      console.warn(
        `[bootstrap] Skipped migrating legacy User admin ${legacy._id} to ${normalizedAdminEmail}: email already used by ${takenByOther.role} user.`
      );
      continue;
    }
    legacy.email = normalizedAdminEmail;
    await legacy.save();
  }

  const userAdmin = await User.findOne({ email: normalizedAdminEmail, role: "admin" });
  const anyUserSameEmail = await User.findOne({ email: normalizedAdminEmail });

  if (!userAdmin && !anyUserSameEmail) {
    try {
      await User.create({
        name: "Glowify Admin",
        email: normalizedAdminEmail,
        password: passwordHash,
        role: "admin",
        phone: ""
      });
    } catch (err) {
      if (err?.code === 11000) {
        console.warn(
          `[bootstrap] Skipped User admin create: ${normalizedAdminEmail} already exists (duplicate email).`
        );
      } else {
        throw err;
      }
    }
  } else if (!userAdmin && anyUserSameEmail && anyUserSameEmail.role !== "admin") {
    console.warn(
      `[bootstrap] Email ${normalizedAdminEmail} is already a "${anyUserSameEmail.role}" user — not creating a second User with admin role. Use Admin collection login or promote this user in MongoDB.`
    );
  }

  const legacyAdminDocs = await Admin.find({ email: "admin@glowify.com" });
  for (const legacy of legacyAdminDocs) {
    const takenByOther = await Admin.findOne({
      email: normalizedAdminEmail,
      _id: { $ne: legacy._id }
    });
    if (takenByOther) {
      console.warn(
        `[bootstrap] Skipped migrating legacy Admin doc ${legacy._id} to ${normalizedAdminEmail}: email already used in Admin collection.`
      );
      continue;
    }
    legacy.email = normalizedAdminEmail;
    await legacy.save();
  }
  const adminExists = await Admin.findOne({ email: normalizedAdminEmail });
  if (!adminExists) {
    try {
      await Admin.create({
        email: normalizedAdminEmail,
        passwordHash,
        name: "Glowify Admin"
      });
    } catch (err) {
      if (err?.code === 11000) {
        console.warn(`[bootstrap] Admin document already exists for ${normalizedAdminEmail} (skipped).`);
      } else {
        throw err;
      }
    }
  }

  await Setting.findOneAndUpdate(
    { key: "global" },
    {
      $setOnInsert: {
        key: "global",
        adminOnline: false,
        siteName: "Glowify Parlour",
        languageOptions: ["en", "ur"],
        currency: "PKR"
      }
    },
    { upsert: true, new: true }
  );
  await Setting.updateOne({ key: "global" }, { $set: { adminNotificationEmail: normalizedAdminEmail } });

  await Category.updateOne(
    { name: "General" },
    { $setOnInsert: { name: "General", description: "General beauty services" } },
    { upsert: true }
  );

  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany(starterServices);
  }

  const translationCount = await Translation.countDocuments({ languageCode: "en" });
  if (translationCount === 0) {
    await Translation.insertMany([
      { key: "booking.title", languageCode: "en", value: "Book Appointment" },
      { key: "booking.title", languageCode: "ur", value: "اپائنٹمنٹ بک کریں" },
      { key: "booking.submit", languageCode: "en", value: "Confirm Booking" },
      { key: "booking.submit", languageCode: "ur", value: "بکنگ کنفرم کریں" }
    ]);
  }

  await runDataMigrations();
}

module.exports = { bootstrapDefaults };
