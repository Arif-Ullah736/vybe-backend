const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { auth } = require("../middlewares/auth.middleware");

router.get("/getUser", auth, userController.getUser);
router.get("/suggestedUsers", auth, userController.suggestedUsers);

module.exports = router;
