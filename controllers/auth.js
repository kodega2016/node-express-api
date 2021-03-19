const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const sendEmail = require("../utils/sendmail");
const crypto = require("crypto");

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return next(new ErrorResponse(`Email address is required`, 500));
  }
  if (!password) {
    return next(new ErrorResponse(`Password is required`, 500));
  }

  let user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new ErrorResponse(
        `No any user is associated with this email address.`,
        400
      )
    );
  }

  const isCorrectpass = await user.matchPassword(password);

  if (!isCorrectpass)
    return next(new ErrorResponse(`Invalid credentials.Try again.`, 400));

  return sendTokenResponse(user, 200, res);
});
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name) {
    return next(new ErrorResponse(`Name is required`, 500));
  }

  if (!email) {
    return next(new ErrorResponse(`Email address is required`, 500));
  }
  if (!password) {
    return next(new ErrorResponse(`Password is required`, 500));
  }

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorResponse(`User is already registered`, 400));
  }

  user = User.create({
    name,
    email,
    password,
  });

  res.status(200).json({
    success: true,
    msg: "Successfully Registered",
    data: user,
  });
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    msg: "Current user is fetched successfully.",
    data: user,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user)
    return next(
      new ErrorResponse(`There is no user with the email ${email}`, 404)
    );

  const token = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/reset-password/${token}`;

  const message = `You are receiving this email because you(or someone else) has requested the reset of a password.Please make a PUT request to :\n\n${resetUrl}`;

  try {
    await sendEmail({
      to: email,
      subject: "Forgot password",
      message,
    });

    res.status(200).json({
      success: true,
      msg: "Password reset link is successfully sent.",
      data: null,
    });
  } catch (e) {
    next(new ErrorResponse("Failed to send password reset link."));
  }
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.password) return next(new ErrorResponse("Enter password", 400));

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  let user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return next(new ErrorResponse("Invalid Token", 400));
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  return sendTokenResponse(user, 200, res);
});

exports.updateDetail = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
    msg: "User info is updated successfully.",
    data: user,
  });
});
