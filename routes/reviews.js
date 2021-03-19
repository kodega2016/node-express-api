const express = require("express");
const {
  getAllReviews,
  addReview,
  getAReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviews");
const router = express.Router({
  mergeParams: true,
});
const { protect } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");
const Review = require("../models/Review");

router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "bootcamp",
      select: "name description",
    }),
    getAllReviews
  )
  .post(protect, addReview);
router
  .route("/:id")
  .get(getAReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
