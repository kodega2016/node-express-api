const express = require("express");
const router = express.Router();
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");
const User = require("../models/User");

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");
const Bootcamp = require("../models/Bootcamp");

router
  .route("/")
  .get(protect, authorize("admin"), advancedResults(User), getAllUsers)
  .post(protect, authorize("admin"), createUser);
router
  .route("/:id")
  .get(getUser)
  .put(protect, authorize("publisher", "admin"), updateUser)
  .delete(protect, authorize("publisher", "admin"), deleteUser);

module.exports = router;
