require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const config = require("./config/database");
const exphbs = require("express-handlebars");

const app = express();

// Built-in body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handlebars setup
const hbs = exphbs.create({
  defaultLayout: false,
  layoutsDir: path.join(__dirname, "views", "layouts"),
  helpers: {
    eq: (a, b) => a === b,
  },
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views")); // ensure correct path

// MongoDB connection
mongoose
  .connect(config.url)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Connection error:", err));

const db = mongoose.connection;
db.on("connected", () => console.log("Mongoose connected"));
db.on("error", (err) => console.error("Mongoose error:", err));
db.on("disconnected", () => console.log("Mongoose disconnected"));

process.on("SIGINT", async () => {
  await db.close();
  console.log("Mongoose disconnected on app termination");
  process.exit(0);
});

// ROUTES
const airbnbUiRoutes = require("./routes/airbnbUiRoutes");
const airbnbApiRoutes = require("./routes/airbnbRoutes");
const employeeUiRoutes = require("./routes/employeeUiRoutes");
const employeeApiRoutes = require("./routes/employeeApiRoutes");

// Home page route
app.get("/", (req, res) => {
  res.render("home", { layout: false });
});

// Register UI first, API second
app.use("/airbnb", airbnbUiRoutes);
app.use("/api/airbnb", airbnbApiRoutes);
app.use("/employees", employeeUiRoutes);
app.use("/api/employees", employeeApiRoutes);

// Error handler (must be after all routes)
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON format",
      error:
        "Please check your JSON syntax. Common issues: trailing commas, unclosed brackets, or invalid characters.",
      details: err.message,
    });
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: err.errors,
    });
  }

  // Mongoose cast errors (invalid ID format)
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
      error: err.message,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Start server
app.listen(config.port, () =>
  console.log(`Server running on http://localhost:${config.port}`)
);
