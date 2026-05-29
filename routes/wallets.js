const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Wallet = require("../models/Wallet");

// GET /api/wallets?bubbleUserId=xxx
router.get("/", async (req, res) => {
  try {
    const { bubbleUserId } = req.query;

    if (!bubbleUserId) {
      return res.status(400).json({
        success: false,
        message: "bubbleUserId is required",
      });
    }

    const user = await User.findOne({ bubbleUserId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sync user first.",
      });
    }

    const wallets = await Wallet.find({ user: user._id }).sort({
      isDefault: -1,
      name: 1,
    });

    return res.json({
      success: true,
      count: wallets.length,
      data: wallets,
    });
  } catch (error) {
    console.error("Get wallets error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get wallets",
      error: error.message,
    });
  }
});

module.exports = router;