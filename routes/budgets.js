const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Category = require("../models/Category");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

async function findUserByBubbleId(bubbleUserId) {
  if (!bubbleUserId) return null;
  return User.findOne({ bubbleUserId });
}

function buildMonthlyDateFilter(month, year) {
  const startDate = new Date(Number(year), Number(month) - 1, 1);
  const endDate = new Date(Number(year), Number(month), 1);

  return {
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  };
}

// POST /api/budgets
router.post("/", async (req, res) => {
  try {
    const { bubbleUserId, categoryId, limitAmount, month, year, note } = req.body;

    if (!bubbleUserId) {
      return res.status(400).json({
        success: false,
        message: "bubbleUserId is required",
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "categoryId is required",
      });
    }

    if (!limitAmount || Number(limitAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "limitAmount must be greater than 0",
      });
    }

    if (!month || Number(month) < 1 || Number(month) > 12) {
      return res.status(400).json({
        success: false,
        message: "month must be between 1 and 12",
      });
    }

    if (!year) {
      return res.status(400).json({
        success: false,
        message: "year is required",
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
      type: "Chi",
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Expense category not found",
      });
    }

    const existingBudget = await Budget.findOne({
      user: user._id,
      category: category._id,
      month: Number(month),
      year: Number(year),
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: "Budget for this category already exists in this month",
      });
    }

    const budget = await Budget.create({
      category: category._id,
      limitAmount: Number(limitAmount),
      month: Number(month),
      year: Number(year),
      user: user._id,
      note: note || "",
      isActive: true,
    });

    const populatedBudget = await Budget.findById(budget._id).populate("category");

    return res.status(201).json({
      success: true,
      message: "Budget created successfully",
      data: populatedBudget,
    });
  } catch (error) {
    console.error("Create budget error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create budget",
      error: error.message,
    });
  }
});

// GET /api/budgets?bubbleUserId=xxx&month=5&year=2026
router.get("/", async (req, res) => {
  try {
    const { bubbleUserId, month, year } = req.query;

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
    };

    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const budgets = await Budget.find(filter)
      .populate("category")
      .sort({ year: -1, month: -1 });

    return res.json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    console.error("Get budgets error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get budgets",
      error: error.message,
    });
  }
});

// GET /api/budgets/status?bubbleUserId=xxx&month=5&year=2026
router.get("/status", async (req, res) => {
  try {
    const { bubbleUserId, month, year } = req.query;

    if (!bubbleUserId) {
      return res.status(400).json({
        success: false,
        message: "bubbleUserId is required",
      });
    }

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "month and year are required",
      });
    }

    const user = await findUserByBubbleId(bubbleUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sync user first.",
      });
    }

    const budgets = await Budget.find({
      user: user._id,
      month: Number(month),
      year: Number(year),
      isActive: true,
    }).populate("category");

    const expenseTransactions = await Transaction.find({
      user: user._id,
      type: "Chi",
      ...buildMonthlyDateFilter(month, year),
    }).populate("category");

    let totalBudget = 0;
    let totalSpent = 0;

    const budgetStatus = budgets.map((budget) => {
      const categoryId = budget.category._id.toString();

      const spentAmount = expenseTransactions
        .filter((transaction) => {
          if (!transaction.category) return false;
          return transaction.category._id.toString() === categoryId;
        })
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const limitAmount = budget.limitAmount;
      const remainingAmount = limitAmount - spentAmount;
      const usedPercentage =
        limitAmount > 0 ? Number(((spentAmount / limitAmount) * 100).toFixed(1)) : 0;

      totalBudget += limitAmount;
      totalSpent += spentAmount;

      return {
        budgetId: budget._id,
        categoryId: budget.category._id,
        categoryName: budget.category.name,
        icon: budget.category.icon,
        color: budget.category.color,
        limitAmount,
        spentAmount,
        remainingAmount,
        usedPercentage,
        isOverBudget: spentAmount > limitAmount,
        note: budget.note,
      };
    });

    const totalRemaining = totalBudget - totalSpent;
    const totalUsedPercentage =
      totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(1)) : 0;

    return res.json({
      success: true,
      period: {
        month: Number(month),
        year: Number(year),
      },
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining,
        totalUsedPercentage,
        isOverBudget: totalSpent > totalBudget,
      },
      data: budgetStatus,
    });
  } catch (error) {
    console.error("Budget status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to calculate budget status",
      error: error.message,
    });
  }
});

// PUT /api/budgets/:id
router.put("/:id", async (req, res) => {
  try {
    const budgetId = req.params.id;
    const { bubbleUserId, limitAmount, note, isActive } = req.body;

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

    const budget = await Budget.findOne({
      _id: budgetId,
      user: user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    if (limitAmount !== undefined) {
      if (Number(limitAmount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "limitAmount must be greater than 0",
        });
      }

      budget.limitAmount = Number(limitAmount);
    }

    if (note !== undefined) budget.note = note;
    if (isActive !== undefined) budget.isActive = isActive;

    await budget.save();

    const updatedBudget = await Budget.findById(budget._id).populate("category");

    return res.json({
      success: true,
      message: "Budget updated successfully",
      data: updatedBudget,
    });
  } catch (error) {
    console.error("Update budget error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update budget",
      error: error.message,
    });
  }
});

// DELETE /api/budgets/:id
router.delete("/:id", async (req, res) => {
  try {
    const budgetId = req.params.id;
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

    const budget = await Budget.findOne({
      _id: budgetId,
      user: user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    await budget.deleteOne();

    return res.json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Delete budget error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete budget",
      error: error.message,
    });
  }
});

module.exports = router;