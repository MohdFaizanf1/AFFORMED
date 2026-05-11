const express = require("express");
const router = express.Router();

const priorityController = require("../controllers/priority.controller");

router.get("/top", priorityController.getTopPriority);

module.exports = router;
