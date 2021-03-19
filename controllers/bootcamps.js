const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const path = require("path");

exports.getAllBootcamps = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const bootcamp = await Bootcamp.findById(id);
  if (!bootcamp)
    return next(new ErrorResponse(`Bootcamp with id ${id} found.`, 404));

  res.status(200).json({
    success: true,
    msg: "Bootcamp fetched successfully.",
    bootcamp,
  });
});

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    website,
    phone,
    email: type,
    address,
    careers,
    averageRating,
    averageCost,
    photo,
    housing,
    jobAssistance,
    jobGuarantee,
    acceptGi,
  } = req.body;

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`The user has already published a bootcamp`, 400)
    );
  }

  const bootcamp = await Bootcamp.create({
    name,
    description,
    website,
    phone,
    email: type,
    address,
    careers,
    averageRating,
    averageCost,
    photo,
    housing,
    jobAssistance,
    jobGuarantee,
    acceptGi,
    user: req.user.id,
  });

  res.status(201).json({
    success: true,
    msg: "Bootcamp is created",
    data: bootcamp,
  });
});

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    description,
    website,
    phone,
    email: type,
    address,
    careers,
    averageRating,
    averageCost,
    photo,
    housing,
    jobAssistance,
    jobGuarantee,
    acceptGi,
  } = req.body;

  const bootcamp = await Bootcamp.findOneAndUpdate(
    { _id: id },
    {
      name,
      description,
      website,
      phone,
      email: type,
      address,
      careers,
      averageRating,
      averageCost,
      photo,
      housing,
      jobAssistance,
      jobGuarantee,
      acceptGi,
      user: req.user.id,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!bootcamp)
    return next(new ErrorResponse(`Bootcamp with id ${id} found.`, 404));

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to perform this action.`, 400)
    );
  }

  res.status(200).json({
    success: true,
    msg: "Bootcamp is updated",
    data: bootcamp,
  });
});

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  let bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) return next(new ErrorResponse(`Bootcamp with id found.`, 404));

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to perform this action.`, 400)
    );
  }

  await bootcamp.delete();

  res.status(200).json({
    success: true,
    msg: "Bootcamp is deleted",
    data: null,
  });
});

exports.getBootcampsinRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    success: true,
    msg: "Bootcamp is fetched",
    data: bootcamps,
  });
});

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  let bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) return next(new ErrorResponse(`Bootcamp with id found.`, 404));

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to perform this action.`, 400)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please select a image file`, 400));
  }
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please select a image file less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      new ErrorResponse(`Problem with file upload`, 500);
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({
      success: true,
      data: file.name,
      msg: "Photo uploaded successfully.",
    });
  });
});
