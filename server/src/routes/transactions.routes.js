const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

function getPagination(query) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
  return { page, limit, skip: (page - 1) * limit };
}

router.get("/", requireAdmin, async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = String(req.query.status).trim().toLowerCase();
  const [transactions, total] = await Promise.all([
    Transaction.find(filter).populate("paymentId").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Transaction.countDocuments(filter)
  ]);
  return res.json({ items: transactions, page, limit, total });
});

router.get("/payment/:paymentId", requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.paymentId)) {
    return res.status(400).json({ message: "Invalid payment id" });
  }
  const transactions = await Transaction.find({ paymentId: req.params.paymentId }).sort({ createdAt: -1 });
  return res.json(transactions);
});

module.exports = router;
