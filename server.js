const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");
const connectDB = require("./config/db");

// Importing API Security Packages
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

// LOAD ENV Variables
dotenv.config({ path: "./config/config.env" });

// Connect to DataBase
connectDB();

// Router files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
app.use(morgan("dev"));

// File uploading
app.use(fileupload());

// APPLYING SECURITY ON API //
// ======================== //

// Sanitize data
app.use(mongoSanitize());

// Add security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes <==
    max: 100, // 100 request per 10 minutes <==
  })
);

// Prevent http param pollution
app.use(hpp());

// Enable cors
app.use(cors());

// ------------------------ //

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 7750;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error:`.red.bold + ` ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
