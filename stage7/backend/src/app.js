const express = require("express");
const cors = require("cors");
const config = require("./config/config");

const requestLogger = require("./middlewares/logger.middleware");
const attachRequestMeta = require("./middlewares/request.middleware");
const errorHandler = require("./middlewares/error.middleware");

const notificationRoutes = require("./routes/notification.routes");
const priorityRoutes = require("./routes/priority.routes");

const app = express();

// cors — allow requests from the frontend
app.use(
  cors({
    origin: config.clientUrl,
    methods: ["GET", "PATCH"],
  })
);

app.use(express.json());
app.use(requestLogger);
app.use(attachRequestMeta);

// routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/priority", priorityRoutes);

// health check
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// centralized error handler — must be last
app.use(errorHandler);

module.exports = app;
