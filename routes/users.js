const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Category = require("../models/Category");
const Wallet = require("../models/Wallet");

const defaultExpenseCategories = [
  {
    name: "Ăn uống",
    type: "Chi",
    icon: "food",
    color: "#FF7A00",
  },
  {
    name: "Tiền nhà",
    type: "Chi",
    icon: "home",
    color: "#FFB020",
  },
  {
    name: "Tập",
    type: "Chi",
    icon: "gym",
    color: "#9B51E0",
  },
  {
    name: "Đi lại",
    type: "Chi",
    icon: "transport",
    color: "#F2994A",
  },
  {
    name: "Quần áo",
    type: "Chi",
    icon: "clothes",
    color: "#2F80ED",
  },
  {
    name: "Y tế",
    type: "Chi",
    icon: "health",
    color: "#27AE60",
  },
  {
    name: "Giải trí",
    type: "Chi",
    icon: "entertainment",
    color: "#EB5757",
  },
  {
    name: "Chi tiêu hằng ngày",
    type: "Chi",
    icon: "daily",
    color: "#00B894",
  },
];

const defaultIncomeCategories = [
  {
    name: "Tiền lương",
    type: "Thu",
    icon: "salary",
    color: "#27AE60",
  },
  {
    name: "Thưởng",
    type: "Thu",
    icon: "bonus",
    color: "#2D9CDB",
  },
  {
    name: "Phụ cấp",
    type: "Thu",
    icon: "allowance",
    color: "#56CCF2",
  },
  {
    name: "Khác",
    type: "Thu",
    icon: "other",
    color: "#BDBDBD",
  },
];

const defaultWallets = [
  {
    name: "Tiền mặt",
    balance: 0,
    icon: "cash",
    color: "#27AE60",
    isDefault: true,
  },
  {
    name: "Ngân hàng",
    balance: 0,
    icon: "bank",
    color: "#2D9CDB",
    isDefault: false,
  },
];

// POST /api/users/sync
router.post("/sync", async (req, res) => {
  try {
    const input = {
  ...req.query,
  ...req.body,
};

console.log("SYNC USER INPUT:", input);

const { bubbleUserId, email, fullName } = input;

    const isInvalidValue = (value) => {
  const text = String(value ?? "").trim().toLowerCase();

  return (
    text === "" ||
    text === "null" ||
    text === "undefined"
  );
};

if (isInvalidValue(bubbleUserId)) {
  return res.status(400).json({
    success: false,
    message: "bubbleUserId is required",
  });
}

if (isInvalidValue(email)) {
  return res.status(400).json({
    success: false,
    message: "email is required",
  });
}

const safeFullName = isInvalidValue(fullName) ? "" : fullName;

    let user = await User.findOne({ bubbleUserId });

    let isNewUser = false;

    if (!user) {
      user = await User.create({
  bubbleUserId,
  email,
  fullName: safeFullName,
  defaultCurrency: "VND",
});

      isNewUser = true;
    }

    const existingCategoryCount = await Category.countDocuments({
      user: user._id,
    });

    if (existingCategoryCount === 0) {
      const categories = [
        ...defaultExpenseCategories,
        ...defaultIncomeCategories,
      ].map((category) => ({
        ...category,
        user: user._id,
        isDefault: true,
      }));

      await Category.insertMany(categories);
    }

    const existingWalletCount = await Wallet.countDocuments({
      user: user._id,
    });

    if (existingWalletCount === 0) {
      const wallets = defaultWallets.map((wallet) => ({
        ...wallet,
        user: user._id,
      }));

      await Wallet.insertMany(wallets);
    }

    const categories = await Category.find({ user: user._id }).sort({
      type: 1,
      name: 1,
    });

    const wallets = await Wallet.find({ user: user._id }).sort({
      isDefault: -1,
      name: 1,
    });

    return res.json({
      success: true,
      message: isNewUser
        ? "User created and default data initialized"
        : "User already exists",
      data: {
        user,
        categories,
        wallets,
      },
    });
  } catch (error) {
    console.error("Sync user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to sync user",
      error: error.message,
    });
  }
});

module.exports = router;