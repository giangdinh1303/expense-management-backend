const express = require("express");
const router = express.Router();

const User = require("../models/User");
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

function buildYearlyDateFilter(year) {
  const startDate = new Date(Number(year), 0, 1);
  const endDate = new Date(Number(year) + 1, 0, 1);

  return {
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  };
}

function calculateTotal(transactions, type) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function summarizeByCategory(transactions, type) {
  const selectedTransactions = transactions.filter(
    (transaction) => transaction.type === type
  );

  const total = selectedTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const summaryMap = new Map();

  selectedTransactions.forEach((transaction) => {
    const category = transaction.category;

    if (!category) return;

    const categoryId = category._id.toString();

    if (!summaryMap.has(categoryId)) {
      summaryMap.set(categoryId, {
        categoryId,
        categoryName: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        amount: 0,
        percentage: 0,
      });
    }

    const item = summaryMap.get(categoryId);
    item.amount += transaction.amount;
  });

  const result = Array.from(summaryMap.values()).map((item) => {
    return {
      ...item,
      percentage:
        total > 0 ? Number(((item.amount / total) * 100).toFixed(1)) : 0,
    };
  });

  result.sort((a, b) => b.amount - a.amount);

  return {
    total,
    items: result,
  };
}

// GET /api/reports/monthly?bubbleUserId=xxx&month=5&year=2026
router.get("/monthly", async (req, res) => {
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

    const transactions = await Transaction.find({
      user: user._id,
      ...buildMonthlyDateFilter(month, year),
    })
      .populate("category")
      .populate("wallet")
      .sort({ date: -1 });

    const totalIncome = calculateTotal(transactions, "Thu");
    const totalExpense = calculateTotal(transactions, "Chi");
    const balance = totalIncome - totalExpense;

    const incomeByCategory = summarizeByCategory(transactions, "Thu");
    const expenseByCategory = summarizeByCategory(transactions, "Chi");

    return res.json({
      success: true,
      period: {
        type: "monthly",
        month: Number(month),
        year: Number(year),
      },
      totalIncome,
      totalExpense,
      balance,
      incomeByCategory,
      expenseByCategory,
      incomeCategoryItems: incomeByCategory.items,
      expenseCategoryItems: expenseByCategory.items,
      transactions,
    });
  } catch (error) {
    console.error("Monthly report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly report",
      error: error.message,
    });
  }
});

// GET /api/reports/yearly
router.get("/yearly", async (req, res) => {
  try {
    const { bubbleUserId, year } = req.query;

    if (!bubbleUserId) {
      return res.status(400).json({
        success: false,
        message: "bubbleUserId is required",
      });
    }

    if (!year) {
      return res.status(400).json({
        success: false,
        message: "year is required",
      });
    }

    const user = await User.findOne({ bubbleUserId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sync user first.",
      });
    }

    const selectedYear = Number(year);

    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear + 1, 0, 1);

    const transactions = await Transaction.find({
      user: user._id,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      const monthTransactions = transactions.filter((transaction) => {
        const transactionMonth = new Date(transaction.date).getMonth() + 1;
        return transactionMonth === month;
      });

      const income = monthTransactions
        .filter((transaction) => transaction.type === "Thu")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const expense = monthTransactions
        .filter((transaction) => transaction.type === "Chi")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      monthlyData.push({
        month,
        label: `${month}/${selectedYear}`,
        income,
        expense,
        balance: income - expense,
      });
    }

    res.json({
      success: true,
      year: selectedYear,
      data: monthlyData,
    });
  } catch (error) {
    console.error("Get yearly report error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error when getting yearly report",
    });
  }
});

module.exports = router;