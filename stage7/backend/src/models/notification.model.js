const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Event", "Result", "Placement"],
      required: [true, "Notification type is required"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// index on type and createdAt for faster filtering + sorting
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
