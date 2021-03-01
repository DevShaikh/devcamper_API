const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// Load ENV
dotenv.config({ path: "./config/config.env" });

// Load Models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");

// Connect DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Get Data through fs
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    console.log("Data Imported...".green.bold);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

const destroyData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    console.log("Data Destroyed...".red.bold);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === "-import") {
  importData();
} else if (process.argv[2] === "-destroy") {
  destroyData();
}
