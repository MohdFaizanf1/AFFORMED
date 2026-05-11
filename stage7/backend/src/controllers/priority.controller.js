const priorityService = require("../services/priority.service");

const getTopPriority = async (req, res, next) => {
  try {
    const topNotifications = await priorityService.getTopPriorityNotifications();

    res.status(200).json({
      success: true,
      message: "Top priority notifications fetched",
      data: topNotifications,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTopPriority };
