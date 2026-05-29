require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const walletRoutes = require("./routes/wallets");
const transactionRoutes = require("./routes/transactions");
const reportRoutes = require("./routes/reports");
const budgetRoutes = require("./routes/budgets");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
  res.send("Expense Backend API is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
    time: new Date()
  });
});

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/budgets", budgetRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});