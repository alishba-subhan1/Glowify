const express = require("express");
const mongoose = require("mongoose");
const Review = require("../models/Review");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { sanitizeText } = require("../utils/validators");

const router = express.Router();

function getPagination(query) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
  return { page, limit, skip: (page - 1) * limit };
}

router.get("/service/:serviceId", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.serviceId)) {
    return res.status(400).json({ message: "Invalid service id" });
  }
  const { page, limit, skip } = getPagination(req.query);
  const filter = { serviceId: req.params.serviceId };
  const [reviews, total] = await Promise.all([
    Review.find(filter)
    .populate("userId", "name profileImage")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit),
    Review.countDocuments(filter)
  ]);
  return res.json({ items: reviews, page, limit, total });
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { serviceId, rating, comment = "" } = req.body;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service id" });
    }
    const score = Number(rating);
    if (!Number.isFinite(score) || score < 1 || score > 5) {
      return res.status(400).json({ message: "Rating must be 1-5" });
    }
    const review = await Review.findOneAndUpdate(
      { userId: req.user.id, serviceId },
      {
        $set: {
          rating: score,
          comment: sanitizeText(comment, 500)
        }
      },
      { upsert: true, new: true }
    );
    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ message: "Failed to save review", error: error.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid review id" });
  }
  const deleted = await Review.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Review not found" });
  return res.json({ message: "Review deleted" });
});

module.exports = router;
