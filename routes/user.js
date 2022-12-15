const express = require("express");
const authController = require("../controllers/user/auth");

const router = express.Router();

router.route("/register").post(authController.register);
router.route("/verify-otp/:userId").post(authController.verifyOtp);
router.route("/login").post(authController.login);

module.exports = router;
