// attaches a requestId and timestamp to each incoming request
// useful for tracing in logs without a full APM setup

const { randomUUID } = require("crypto");

const attachRequestMeta = (req, res, next) => {
  req.requestId = randomUUID();
  req.receivedAt = new Date().toISOString();

  // expose requestId in response headers for client-side tracing
  res.setHeader("X-Request-Id", req.requestId);

  next();
};

module.exports = attachRequestMeta;
