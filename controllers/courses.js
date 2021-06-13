const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @Desc        Get courses
// @route       GET api/v1/courses
// @route       GET api/v1/bootcamps/:bootcampID/courses
// @Acess       Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampID) {
    const courses = await Course.find({ bootcamp: req.params.bootcampID });

    return res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } else {
    res.status(200).json(res.advanceResults);
  }
});

// @Desc        Get single course
// @route       GET api/v1/courses
// @Acess       Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @Desc        Add course
// @route       POST api/v1/bootcamps/:bootcampID/courses
// @Acess       Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampID;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampID);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp found with the id of ${req.params.bootcampID}`,
        404
      )
    );
  }

  // Making sure that logged in user is the owner of bootcamp or user role is admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @Desc        Update course
// @route       PUT api/v1/courses/:id
// @Acess       Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course found with the id of ${req.params.id}`, 404)
    );
  }

  console.log(course.user.toString(), req.user.id);

  // Making sure that logged in user is the owner of course or user role is admin
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update course ${bootcamp._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @Desc        Delete course
// @route       DELETE api/v1/courses/:id
// @Acess       Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course found with the id of ${req.params.id}`, 404)
    );
  }

  // Making sure that logged in user is the owner of course or user role is admin
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete course ${bootcamp._id}`,
        401
      )
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
