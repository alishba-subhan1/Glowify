const User = require("../models/User");
const Service = require("../models/Service");
const Booking = require("../models/Booking");
const Category = require("../models/Category");
const Notification = require("../models/Notification");
const Setting = require("../models/Setting");

/** Names + pricing aligned with marketing site booking catalog (BookingPage). Only inserted if missing — never overwrites admin edits. */
const CATALOG_SERVICES = [
  { name: "Bridal Makeup", price: 15000, duration: 180, category: "Bridal", description: "Full bridal makeup with long-wear products and contouring." },
  { name: "Event Makeup", price: 8000, duration: 90, category: "Makeup", description: "Event-ready makeup tailored to outfit and venue." },
  { name: "Festive Makeup", price: 6500, duration: 75, category: "Makeup", description: "Festive occasion makeup with bold or soft glam options." },
  { name: "Mehndi Makeup", price: 10000, duration: 90, category: "Makeup", description: "Mehndi event makeup with photo-friendly finish." },
  { name: "Hair Styling", price: 3500, duration: 60, category: "Hair", description: "Professional styling for any occasion." },
  { name: "Hair Curling", price: 2800, duration: 45, category: "Hair", description: "Curls and waves with heat styling." },
  { name: "Hair Straightening", price: 3200, duration: 60, category: "Hair", description: "Sleek straight finish with smoothing care." },
  { name: "Hair Dry / Blow Dry", price: 2000, duration: 30, category: "Hair", description: "Volume blow dry or smooth finish." },
  { name: "Hair Dye / Hair Coloring", price: 6000, duration: 120, category: "Hair", description: "Hair color application with gloss or full coverage." },
  { name: "Other Hair Styling Needs", price: 4000, duration: 45, category: "Hair", description: "Custom hair styling by consultation." },
  { name: "Facial Treatments", price: 4500, duration: 60, category: "Facial", description: "Facials for glow, hydration, or deep cleansing." },
  { name: "Skin Polishing", price: 5000, duration: 55, category: "Facial", description: "Exfoliation and polish for even tone." },
  { name: "Anti-Shedding Treatment", price: 5500, duration: 60, category: "Hair", description: "Strengthening treatment to reduce breakage." },
  { name: "Eyelash Extensions", price: 7000, duration: 90, category: "Lashes", description: "Classic or volume lash extensions." },
  { name: "Nail Extensions", price: 6500, duration: 75, category: "Nails", description: "Gel extensions with shaping and finish." },
  { name: "Eyebrow Shaping", price: 1200, duration: 30, category: "Brows", description: "Brow threading, waxing, or tweezing." },
  { name: "Full Body Waxing", price: 6500, duration: 90, category: "Waxing", description: "Full-body wax service by appointment length." },
  { name: "Arms & Legs Waxing", price: 3500, duration: 45, category: "Waxing", description: "Arms and legs waxing package." }
];

async function ensureCatalogServicesFromWebsite() {
  for (const item of CATALOG_SERVICES) {
    const exists = await Service.exists({
      $or: [{ name: item.name }, { title: item.name }]
    });
    if (exists) continue;
    await Service.create({
      title: item.name,
      name: item.name,
      description: item.description,
      duration: item.duration,
      durationMinutes: item.duration,
      price: item.price,
      category: item.category,
      image: "",
      isActive: true
    });
  }
}

async function ensureDefaultSettings() {
  const { defaultAdminEmail } = require("../config");
  const adminEmail =
    typeof defaultAdminEmail === "string"
      ? defaultAdminEmail.trim().toLowerCase()
      : "";

  const payload = {
    $setOnInsert: {
      key: "global",
      siteName: "Glowify Parlour",
      logo: "",
      languageOptions: ["en", "ur"],
      currency: "PKR",
      adminOnline: false,
      timeSlots: ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
    }
  };
  if (adminEmail && adminEmail.includes("@")) {
    payload.$set = { adminNotificationEmail: adminEmail };
  }
  await Setting.findOneAndUpdate({ key: "global" }, payload, { upsert: true });
}
async function migrateServicesToCategoryRefs() {
  const services = await Service.find();
  for (const service of services) {
    if (!service.title) service.title = service.name || "Untitled Service";
    if (!service.name) service.name = service.title;
    if (!service.duration) service.duration = service.durationMinutes || 30;
    if (!service.durationMinutes) service.durationMinutes = service.duration;
    if (!service.category) service.category = "General";

    if (!service.categoryId) {
      const categoryName = String(service.category || "General").trim();
      const category = await Category.findOneAndUpdate(
        { name: categoryName },
        { $setOnInsert: { name: categoryName, description: `${categoryName} services` } },
        { upsert: true, new: true }
      );
      service.categoryId = category._id;
    }
    await service.save();
  }
}

async function migrateBookingsToFullSchema() {
  const bookings = await Booking.find();
  for (const booking of bookings) {
    if (!booking.serviceId && booking.service) booking.serviceId = booking.service;
    if (!booking.service && booking.serviceId) booking.service = booking.serviceId;
    if (!booking.time && booking.slot) booking.time = booking.slot;
    if (!booking.slot && booking.time) booking.slot = booking.time;
    if (!booking.paymentMethod) booking.paymentMethod = "cash";

    if (!booking.userId && booking.customerEmail) {
      const user = await User.findOne({ email: String(booking.customerEmail).trim().toLowerCase() });
      if (user) booking.userId = user._id;
    }
    await booking.save();
  }
}

async function migrateNotifications() {
  const notifications = await Notification.find({ recipientType: "customer" });
  for (const item of notifications) {
    if (!item.userId && item.recipientId && item.recipientId.includes("@")) {
      const user = await User.findOne({ email: String(item.recipientId).trim().toLowerCase() });
      if (user) {
        item.userId = user._id;
        await item.save();
      }
    }
  }
}

async function runDataMigrations() {
  await ensureDefaultSettings();
  await ensureCatalogServicesFromWebsite();
  await migrateServicesToCategoryRefs();
  await migrateBookingsToFullSchema();
  await migrateNotifications();
}

module.exports = { runDataMigrations };
