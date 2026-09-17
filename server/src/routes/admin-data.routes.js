const express = require("express");
const mongoose = require("mongoose");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAdmin);

/** App collections admins may browse (omit system / unknown). */
const ALLOWED = new Set([
  "bookings",
  "users",
  "services",
  "categories",
  "payments",
  "transactions",
  "reviews",
  "notifications",
  "translations",
  "settings",
  "messages",
  "admins"
]);

function sanitizeCollection(name) {
  const n = String(name || "").trim();
  return ALLOWED.has(n) ? n : null;
}

function getPagination(query) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 25)));
  return { page, limit, skip: (page - 1) * limit };
}

const OID_RE = /^[a-f\d]{24}$/i;

const OID_KEYS = new Set([
  "_id",
  "userId",
  "serviceId",
  "bookingId",
  "paymentId",
  "categoryId",
  "service"
]);

function coerceForMongo(value, keyHint = "") {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((item) => coerceForMongo(item, keyHint));

  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = coerceForMongo(v, k);
    return out;
  }

  if (typeof value === "string") {
    if (OID_KEYS.has(keyHint) && OID_RE.test(value)) {
      try {
        return new mongoose.Types.ObjectId(value);
      } catch {
        return value;
      }
    }
    if ((/^createdAt|^updatedAt$/i.test(keyHint) || /At$/i.test(keyHint)) && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return value;
  }

  return value;
}

function docFromClientBody(body, preserveIdFromUrl = null) {
  const incoming = typeof body.document === "object" && body.document !== null ? body.document : body;
  const copy = coerceForMongo(JSON.parse(JSON.stringify(incoming)));
  if (preserveIdFromUrl != null && mongoose.Types.ObjectId.isValid(String(preserveIdFromUrl))) {
    copy._id = new mongoose.Types.ObjectId(String(preserveIdFromUrl));
  } else if (copy._id) {
    delete copy._id;
  }
  return copy;
}

/** GET /collections */
router.get("/collections", async (_req, res) => {
  try {
    const cols = await mongoose.connection.db.listCollections().toArray();
    const names = cols.map((c) => c.name).filter((n) => ALLOWED.has(n)).sort();
    const stats = await Promise.all(
      names.map(async (name) => ({
        name,
        count: await mongoose.connection.db.collection(name).countDocuments()
      }))
    );
    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ message: "Failed to list collections", error: error.message });
  }
});

/** GET /documents/:collection */
router.get("/documents/:collection", async (req, res) => {
  const coll = sanitizeCollection(req.params.collection);
  if (!coll) return res.status(400).json({ message: "Unknown or forbidden collection" });
  try {
    const { page, limit, skip } = getPagination(req.query);
    const col = mongoose.connection.db.collection(coll);
    const filter = {};
    try {
      if (req.query.q && mongoose.Types.ObjectId.isValid(req.query.q)) {
        filter._id = new mongoose.Types.ObjectId(String(req.query.q));
      }
    } catch {
      /* ignore malformed id query */
    }
    const sort = req.query.sortField
      ? { [String(req.query.sortField)]: Number(req.query.sortDir) === 1 ? 1 : -1 }
      : { _id: -1 };
    const [items, total] = await Promise.all([
      col.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      col.countDocuments(filter)
    ]);
    return res.json({
      collection: coll,
      items,
      page,
      limit,
      total
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to list documents", error: error.message });
  }
});

/** GET /documents/:collection/:id */
router.get("/documents/:collection/:id", async (req, res) => {
  const coll = sanitizeCollection(req.params.collection);
  if (!coll) return res.status(400).json({ message: "Unknown or forbidden collection" });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid document id" });
  }
  try {
    const oid = new mongoose.Types.ObjectId(req.params.id);
    const doc = await mongoose.connection.db.collection(coll).findOne({ _id: oid });
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json(doc);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load document", error: error.message });
  }
});

/** PUT /documents/:collection/:id — replace full document (_id preserved from URL). */
router.put("/documents/:collection/:id", async (req, res) => {
  const coll = sanitizeCollection(req.params.collection);
  if (!coll) return res.status(400).json({ message: "Unknown or forbidden collection" });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid document id" });
  }
  try {
    const oid = new mongoose.Types.ObjectId(req.params.id);
    const existing = await mongoose.connection.db.collection(coll).findOne({ _id: oid });
    if (!existing) return res.status(404).json({ message: "Not found" });
    let doc;
    try {
      doc = docFromClientBody(req.body, oid);
    } catch (parseErr) {
      return res.status(400).json({ message: "Invalid JSON body", error: parseErr.message });
    }
    doc._id = oid;
    await mongoose.connection.db.collection(coll).replaceOne({ _id: oid }, doc);
    const fresh = await mongoose.connection.db.collection(coll).findOne({ _id: oid });
    return res.json(fresh);
  } catch (error) {
    return res.status(500).json({ message: "Failed to save document", error: error.message });
  }
});

/** POST /documents/:collection — insert new document. */
router.post("/documents/:collection", async (req, res) => {
  const coll = sanitizeCollection(req.params.collection);
  if (!coll) return res.status(400).json({ message: "Unknown or forbidden collection" });
  try {
    let doc;
    try {
      doc = docFromClientBody(req.body, null);
    } catch (parseErr) {
      return res.status(400).json({ message: "Invalid JSON body", error: parseErr.message });
    }
    delete doc._id;
    const result = await mongoose.connection.db.collection(coll).insertOne(doc);
    const fresh = await mongoose.connection.db.collection(coll).findOne({ _id: result.insertedId });
    return res.status(201).json(fresh);
  } catch (error) {
    return res.status(500).json({ message: "Failed to insert document", error: error.message });
  }
});

/** DELETE /documents/:collection/:id */
router.delete("/documents/:collection/:id", async (req, res) => {
  const coll = sanitizeCollection(req.params.collection);
  if (!coll) return res.status(400).json({ message: "Unknown or forbidden collection" });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid document id" });
  }
  try {
    const oid = new mongoose.Types.ObjectId(req.params.id);
    const deleted = await mongoose.connection.db.collection(coll).deleteOne({ _id: oid });
    if (!deleted.deletedCount) return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Deleted", id: oid.toString() });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete document", error: error.message });
  }
});

module.exports = router;
