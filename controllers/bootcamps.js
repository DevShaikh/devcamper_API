const path = require("path");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const geocoder = require("../utils/geocoder");
const { query } = require("express");

// @Desc        Get all bootcamps
// @route       GET api/v1/bootcamps
// @Acess       Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advanceResults);
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

// @Desc        Upload photo for a bootcamp
// @route       PUT api/v1/bootcamps/:id/photo
// @Acess       Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse("Bootcamp not found", 404));
  }

  if (!req.files) {
    return next(new ErrorResponse("Please upload a file", 400));
  }

  const file = req.files.file;

  // Make sure its a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload an image file", 400));
  }

  // Check file size
  if (!file.size > process.env.MAX_FILE_SIZE) {
    return next(
      new ErrorResponse(
        `Please upload an image file less then ${process.env.MAX_FILE_SIZE}bytes `,
        400
      )
    );
  }

  // Custom filename
  file.name = `photo_${bootcamp.id}${path.parse(file.name).ext}`;

  // Upload file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
