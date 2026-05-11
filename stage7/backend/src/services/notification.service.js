const notificationDao = require("../dao/notification.dao");

const getNotifications = async ({ page, limit, notification_type }) => {
  const filter = {};

  if (notification_type) {
    filter.type = notification_type;
  }

  const { notifications, total } = await notificationDao.findAll({
    filter,
    page,
    limit,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    notifications,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

const getNotificationById = async (id) => {
  const notification = await notificationDao.findById(id);
  if (!notification) {
    const err = new Error("Notification not found");
    err.statusCode = 404;
    throw err;
  }
  return notification;
};

const markNotificationRead = async (id) => {
  const updated = await notificationDao.markAsRead(id);
  if (!updated) {
    const err = new Error("Notification not found");
    err.statusCode = 404;
    throw err;
  }
  return updated;
};

const getUnreadCount = async () => {
  const count = await notificationDao.countUnread();
  return { unreadCount: count };
};

module.exports = {
  getNotifications,
  getNotificationById,
  markNotificationRead,
  getUnreadCount,
};
