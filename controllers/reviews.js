const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const Bootcamp = require("../models/Bootcamp");
const Review = require("../models/Review");

// @Desc        Get Reviews
// @route       GET api/v1/reviews
// @route       GET api/v1/bootcamps/:bootcampID/Reviews
// @Acess       Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampID) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampID });

    return res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  } else {
    res.status(200).json(res.advanceResults);
  }
});

// @Desc        Get Single Review
// @route       GET api/v1/reviews/:id
// @Acess       Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "Bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(
      new ErrorResponse("No review found with the id of " + req.params.id, 404)
    );
  }

  res.status(200).json({ success: true, data: review });
});

// @Desc        Add a Review
// @route       POST api/v1/bootcamps/:bootcampID/Reviews
// @Acess       Public
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampID;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampID);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        "No bootcamp found with the id of " + req.params.bootcampID,
        404
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({ success: true, data: review });
});

// @Desc        Update Review
// @route       PUT api/v1/reviews/:id
// @Acess       Public
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse("No review found with the id of " + req.params.id, 404)
    );
  }

  // Making sure that the user is owner of this review
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized to update review", 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({ success: true, data: review });
});

// @Desc        Delete Review
// @route       DELETE api/v1/reviews/:id
// @Acess       Public
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse("No review found with the id of " + req.params.id, 404)
    );
  }

  // Making sure that the user is owner of this review
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized to update review", 401));
  }

  await review.remove();

  res.status(201).json({ success: true, data: {} });
});
