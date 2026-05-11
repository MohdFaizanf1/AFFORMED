const notificationDao = require("../dao/notification.dao");

// weights assigned to each notification type
const TYPE_WEIGHT = {
  Placement: 100,
  Result: 60,
  Event: 20,
};

// recency bonus: decays over time (in hours)
const getRecencyScore = (createdAt) => {
  const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);

  if (ageInHours < 2) return 50;
  if (ageInHours < 12) return 30;
  if (ageInHours < 48) return 15;
  return 5;
};

const computePriorityScore = (notification) => {
  const typeScore = TYPE_WEIGHT[notification.type] || 0;
  const recencyScore = getRecencyScore(notification.createdAt);
  const unreadBonus = notification.isRead ? 0 : 10;

  return typeScore + recencyScore + unreadBonus;
};

const getTopPriorityNotifications = async () => {
  const notifications = await notificationDao.findForPriority();

  const scored = notifications.map((n) => ({
    ...n,
    priorityScore: computePriorityScore(n),
  }));

  // sort descending by score and return top 10
  scored.sort((a, b) => b.priorityScore - a.priorityScore);

  return scored.slice(0, 10);
};

module.exports = { getTopPriorityNotifications, computePriorityScore };
