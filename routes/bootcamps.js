const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsWithinRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");

// Includes other resources
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

const router = express.Router();

const advanceResults = require("../middleware/advanceResults");
const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers
router.use("/:bootcampID/courses", courseRouter);
router.use("/:bootcampID/reviews", reviewRouter);

router
  .route("/")
  .get(advanceResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

// Route with ID
router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

// Routes with zipcode & distance
router.route("/radius/:zipcode/:distance").get(getBootcampsWithinRadius);

module.exports = router;
