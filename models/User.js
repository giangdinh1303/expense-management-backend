const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    bubbleUserId: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      default: "",
    },

    defaultCurrency: {
      type: String,
      default: "VND",
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);