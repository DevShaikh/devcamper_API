const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const geocoder = require("../utils/geocoder");
const { query } = require("express");

// @Desc        Get all bootcamps
// @route       GET api/v1/bootcamps
// @Acess       Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // Getting query and generating mongoose property

  let query;

  const reqQuery = { ...req.query };

  const removeFields = ["select", "sort", "page", "limit"];

  removeFields.forEach((field) => delete reqQuery[field]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/, (found) => `$${found}`);
  queryStr = JSON.parse(queryStr);

  query = Bootcamp.find(queryStr).populate("courses");

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
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Now fetching bootcamps according to the query
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
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
});

// @Desc        Get single bootcamp
// @route       GET api/v1/bootcamps/:id
// @Acess       Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse("Bootcamp not found", 404));
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @Desc        Get bootcamps within radius
// @route       GET api/v1/bootcamps/radius/:zipcode/:distance
// @Acess       Public
exports.getBootcampsWithinRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  // Calc radius using radians
  // Divide distance with radius of Earth
  // Earth radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  // Find bootcamp by radius
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @Desc        Create new bootcamp
// @route       POST api/v1/bootcamps
// @Acess       Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: "true",
    data: bootcamp,
  });
});

// @Desc        Update bootcamp
// @route       PUT api/v1/bootcamps/:id
// @Acess       Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(new ErrorResponse("Bootcamp not found", 404));
  }
  return res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @Desc        update bootcamp
// @route       DELETE api/v1/bootcamps/:id
// @Acess       Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse("Bootcamp not found", 404));
  }
  bootcamp.remove();
  return res.status(200).json({
    success: true,
    msg: "Bootcamp removed!",
  });
});
