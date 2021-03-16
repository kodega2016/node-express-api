const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");

exports.getAllBootcamps = asyncHandler(async (req, res) => {
  let query;

  const reqQuery = { ...req.query };

  const removeFields = ["select", "sort", "page", "limit"];

  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  query = Bootcamp.find(JSON.parse(queryStr));

  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);
  const bootcamps = await query;

  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    msg: "Bootcamps fetched successfully.",
    bootcamps,
    pagination,
  });
});

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const bootcamp = await Bootcamp.findById(id);
  if (!bootcamp)
    return next(new ErrorResponse(`Bootcamp with id ${id} found.`, 401));

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
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!bootcamp)
    return next(new ErrorResponse(`Bootcamp with id ${id} found.`, 401));

  res.status(200).json({
    success: true,
    msg: "Bootcamp is updated",
    data: bootcamp,
  });
});

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  let bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) return next(new ErrorResponse(`Bootcamp with id found.`, 401));

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
