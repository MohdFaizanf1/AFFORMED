const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");
const { validateListQuery, validateObjectId } = require("../validator/notification.validator");

router.get("/", validateListQuery, notificationController.getAllNotifications);

router.get("/unread/count", notificationController.getUnreadCount);

router.get("/:id", validateObjectId, notificationController.getSingleNotification);

router.patch("/:id/read", validateObjectId, notificationController.markAsRead);

module.exports = router;
