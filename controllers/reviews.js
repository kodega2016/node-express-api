const asyncHandler = require("../middleware/async");
const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");

// @desc      Get all reviews
// @route     GET /api/v1/reviews/
// @route     GET /api/v1/bootcamps/:id/reviews/:id
// @access    Public

exports.getAllReviews = asyncHandler(async (req, res) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({
      bootcamp: req.params.bootcampId,
    }).populate({
      path: "bootcamp",
      select: "name description",
    });

    return res.status(200).json({
      success: true,
      msg: "Review is successfully fetched.",
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get a review
// @route     GET /api/v1/reviews/:id
// @route     GET /api/v1/bootcamps/:id/reviews/:id
// @access    Public
exports.getAReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review)
    return next(
      new ErrorResponse(`Review with id ${req.params.bootcampId} found.`, 404)
    );

  return res.status(201).json({
    success: true,
    msg: "Review is successfully fetched.",
    data: review,
  });
});

// @desc      Add a review
// @route     POST /api/v1/reviews/:id
// @route     POST /api/v1/bootcamps/:id/reviews/:id
// @access    Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.bootcampId} found.`, 404)
    );

  const review = await Review.create(req.body);

  return res.status(201).json({
    success: true,
    msg: "Review is successfully added.",
    data: review,
  });
});

// @desc      Update a course
// @route     PUT /api/v1/reviews/:id
// @route     PUT /api/v1/bootcamps/:id/reviews/:id
// @access    Private

exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review)
    return next(
      new ErrorResponse(`Review with id ${req.params.id} found.`, 404)
    );

  if (review.user.toString() !== req.user.id)
    return next(new ErrorResponse(`Not authorized.`, 404));

  review = await Review.findByIdAndUpdate(req.params.id, req.body);

  return res.status(201).json({
    success: true,
    msg: "Review is successfully updated.",
    data: review,
  });
});
// @desc      Delete a course
// @route     DELETE /api/v1/reviews/:id
// @route     DELETE /api/v1/bootcamps/:id/reviews/:id
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review)
    return next(
      new ErrorResponse(`Review with id ${req.params.id} found.`, 404)
    );

  if (review.user.toString() !== req.user.id)
    return next(new ErrorResponse(`Not authorized.`, 404));

  review = await Review.findByIdAndDelete(req.params.id, {
    new: true,
    runValidators: true,
  });

  return res.status(201).json({
    success: true,
    msg: "Review is successfully deleted.",
    data: null,
  });
});
