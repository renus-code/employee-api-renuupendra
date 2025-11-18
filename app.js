require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const config = require("./config/database");

const app = express();

// Built‑in Express body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose
  .connect(config.url)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Connection error:", err));

const db = mongoose.connection;

// Event logs
db.on("connected", () => console.log("Mongoose connected"));
db.on("error", (err) => console.error("Mongoose error:", err));
db.on("disconnected", () => console.log("Mongoose disconnected"));

// Graceful shutdown
process.on("SIGINT", async () => {
  await db.close();
  console.log("Mongoose disconnected on app termination");
  process.exit(0);
});

// Load routes
const employeeRoutes = require("./routes/employees");
app.use("/api/employees", employeeRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: err.errors,
    });
  }

  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
