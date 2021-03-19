const express = require("express");
const router = express.Router();
const {
  login,
  register,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetail,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/me").get(protect, getMe);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:resetToken").put(resetPassword);
router.route("/update-info").put(protect, updateDetail);

module.exports = router;
