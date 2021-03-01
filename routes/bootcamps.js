const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsWithinRadius,
} = require("../controllers/bootcamps");

// Includes other resources
const courseRouter = require("./courses");

const router = express.Router();

// Re-route into other resource routers
router.use("/:bootcampID/courses", courseRouter);

router.route("/").get(getBootcamps).post(createBootcamp);

// Route with ID
router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

// Routes with zipcode & distance
router.route("/radius/:zipcode/:distance").get(getBootcampsWithinRadius);

module.exports = router;
