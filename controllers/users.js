const asyncHandler = require("../middleware/async");
const User = require("../models/User");

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private

exports.getAllUsers = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get a user
// @route     GET /api/v1/users/:id
// @access    Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(201).json({
    success: true,
    msg: "user is fetched",
    data: user,
  });
});
// @desc      Add a user
// @route     POST /api/v1/users/:id
// @access    Private

exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    msg: "New user is created",
    data: user,
  });
});

// @desc      Update a user
// @route     PUT /api/v1/users/:id
// @access    Private

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    success: true,
    msg: "New user is created",
    data: user,
  });
});

// @desc      Delete a user
// @route     DELETE /api/v1/users/:id
// @access    Private

exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    msg: "user is deleted",
    data: null,
  });
});
