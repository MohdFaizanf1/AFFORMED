const mongoose = require("mongoose");

const VALID_TYPES = ["Event", "Result", "Placement"];

// validates query params for GET /api/notifications
const validateListQuery = (req, res, next) => {
  const { page, limit, notification_type } = req.query;

  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      message: "Query param 'page' must be a positive integer",
    });
  }

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      message: "Query param 'limit' must be between 1 and 100",
    });
  }

  if (notification_type && !VALID_TYPES.includes(notification_type)) {
    return res.status(400).json({
      success: false,
      message: `'notification_type' must be one of: ${VALID_TYPES.join(", ")}`,
    });
  }

  next();
};

// validates MongoDB ObjectId in route params
const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid notification ID format",
    });
  }

  next();
};

module.exports = { validateListQuery, validateObjectId };
