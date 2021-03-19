const Course = require("../models/Course");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({
      bootcamp: req.params.bootcampId,
    });
    return res.status(200).json({
      success: true,
      msg: "Courses fetched successfully.",
      data: courses,
    });
  } else {
    return res.status(200).json(res.advancedResults);
  }
});

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course)
    return next(
      new ErrorResponse(`Course with id ${req.params.id} found.`, 401)
    );

  res.status(200).json({
    success: true,
    msg: "Course fetched successfully.",
    data: course,
  });
});

exports.addCourse = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp with id ${req.params.bootcampId} is not found.`,
        404
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    msg: "Course is added",
    data: course,
  });
});

exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course with id ${req.params.id} is not found.`, 404)
    );
  }

  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to perform this action.`, 400)
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({
    success: true,
    msg: "Course is updated",
    data: course,
  });
});

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course with id ${req.params.id} is not found.`, 404)
    );
  }

  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to perform this action.`, 400)
    );
  }

  await course.delete();

  res.status(200).json({
    success: true,
    msg: "Course is deleted",
    data: null,
  });
});
