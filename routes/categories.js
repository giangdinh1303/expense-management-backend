const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Category = require("../models/Category");

// GET /api/categories?bubbleUserId=xxx&type=Chi
router.get("/", async (req, res) => {
  try {
    const { bubbleUserId, type } = req.query;

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

    const filter = {
      user: user._id,
    };

    if (type) {
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({
      type: 1,
      name: 1,
    });

    return res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get categories",
      error: error.message,
    });
  }
});

module.exports = router;