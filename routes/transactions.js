const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Category = require("../models/Category");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

function getWalletChange(type, amount) {
  if (type === "Thu") return Number(amount);
  if (type === "Chi") return -Number(amount);
  return 0;
}

function buildDateFilter(month, year) {
  if (!month || !year) return {};

  const startDate = new Date(Number(year), Number(month) - 1, 1);
  const endDate = new Date(Number(year), Number(month), 1);

  return {
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  };
}

async function findUserByBubbleId(bubbleUserId) {
  if (!bubbleUserId) return null;
  return User.findOne({ bubbleUserId });
}

// POST /api/transactions
router.post("/", async (req, res) => {
  try {
    const input = {
  ...req.query,
  ...req.body,
};

console.log("CREATE TRANSACTION INPUT:", input);

const {
  bubbleUserId,
  amount,
  type,
  description,
  date,
  categoryId,
  walletId,
  note,
} = input;

    if (!bubbleUserId) {
      return res.status(400).json({
        success: false,
        message: "bubbleUserId is required",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be greater than 0",
      });
    }

    if (!["Thu", "Chi"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "type must be Thu or Chi",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date is required",
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "categoryId is required",
      });
    }

    const user = await findUserByBubbleId(bubbleUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sync user first.",
      });
    }

    const category = await Category.findOne({
      _id: categoryId,
      user: user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.type !== type) {
      return res.status(400).json({
        success: false,
        message: "Category type does not match transaction type",
      });
    }

    let wallet = null;

    if (walletId) {
      wallet = await Wallet.findOne({
        _id: walletId,
        user: user._id,
      });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: "Wallet not found",
        });
      }
    }

    const transaction = await Transaction.create({
      amount: Number(amount),
      type,
      description: description || "",
      date: new Date(date),
      category: category._id,
      wallet: wallet ? wallet._id : null,
      user: user._id,
      note: note || "",
    });

    if (wallet) {
      wallet.balance += getWalletChange(type, Number(amount));
      await wallet.save();
    }

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("category")
      .populate("wallet");

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: populatedTransaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create transaction",
      error: error.message,
    });
  }
});

// GET /api/transactions?bubbleUserId=xxx&month=5&year=2026&type=Chi
router.get("/", async (req, res) => {
  try {
    console.log("GET TRANSACTIONS QUERY:", req.query);
    const { bubbleUserId, month, year, type } = req.query;

    if (!bubbleUserId) {
      return res.status(400).json({
        success: false,
        message: "bubbleUserId is required",
      });
    }

    const user = await findUserByBubbleId(bubbleUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sync user first.",
      });
    }

    const filter = {
      user: user._id,
      ...buildDateFilter(month, year),
    };

    if (type) {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter)
      .populate("category")
      .populate("wallet")
      .sort({ date: -1, createdAt: -1 });

    return res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get transactions",
      error: error.message,
    });
  }
});

// PUT /api/transactions/:id
router.put("/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;

    const {
      bubbleUserId,
      amount,
      type,
      description,
      date,
      categoryId,
      walletId,
      note,
    } = req.body;

    if (!bubbleUserId) {
      return res.status(400).json({
        success: false,
        message: "bubbleUserId is required",
      });
    }

    const user = await findUserByBubbleId(bubbleUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sync user first.",
      });
    }

    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const oldAmount = transaction.amount;
    const oldType = transaction.type;
    const oldWalletId = transaction.wallet ? transaction.wallet.toString() : null;

    const newAmount = amount !== undefined ? Number(amount) : transaction.amount;
    const newType = type || transaction.type;
    const newWalletId = walletId !== undefined ? walletId : oldWalletId;

    if (newAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be greater than 0",
      });
    }

    if (!["Thu", "Chi"].includes(newType)) {
      return res.status(400).json({
        success: false,
        message: "type must be Thu or Chi",
      });
    }

    if (categoryId) {
      const category = await Category.findOne({
        _id: categoryId,
        user: user._id,
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      if (category.type !== newType) {
        return res.status(400).json({
          success: false,
          message: "Category type does not match transaction type",
        });
      }

      transaction.category = category._id;
    }

    if (oldWalletId) {
      const oldWallet = await Wallet.findOne({
        _id: oldWalletId,
        user: user._id,
      });

      if (oldWallet) {
        oldWallet.balance -= getWalletChange(oldType, oldAmount);
        await oldWallet.save();
      }
    }

    let newWallet = null;

    if (newWalletId) {
      newWallet = await Wallet.findOne({
        _id: newWalletId,
        user: user._id,
      });

      if (!newWallet) {
        return res.status(404).json({
          success: false,
          message: "Wallet not found",
        });
      }

      newWallet.balance += getWalletChange(newType, newAmount);
      await newWallet.save();

      transaction.wallet = newWallet._id;
    } else {
      transaction.wallet = null;
    }

    transaction.amount = newAmount;
    transaction.type = newType;

    if (description !== undefined) transaction.description = description;
    if (date) transaction.date = new Date(date);
    if (note !== undefined) transaction.note = note;

    await transaction.save();

    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate("category")
      .populate("wallet");

    return res.json({
      success: true,
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update transaction",
      error: error.message,
    });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { bubbleUserId } = req.body;

    if (!bubbleUserId) {
      return res.status(400).json({
        success: false,
        message: "bubbleUserId is required",
      });
    }

    const user = await findUserByBubbleId(bubbleUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sync user first.",
      });
    }

    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.wallet) {
      const wallet = await Wallet.findOne({
        _id: transaction.wallet,
        user: user._id,
      });

      if (wallet) {
        wallet.balance -= getWalletChange(transaction.type, transaction.amount);
        await wallet.save();
      }
    }

    await transaction.deleteOne();

    return res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
});

module.exports = router;