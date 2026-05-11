const notificationService = require("../services/notification.service");

const getAllNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const notification_type = req.query.notification_type || null;

    const result = await notificationService.getNotifications({
      page,
      limit,
      notification_type,
    });

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: result.notifications,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const getSingleNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.getNotificationById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Notification fetched successfully",
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const updated = await notificationService.markNotificationRead(req.params.id);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount();

    res.status(200).json({
      success: true,
      message: "Unread count fetched",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllNotifications,
  getSingleNotification,
  markAsRead,
  getUnreadCount,
};
