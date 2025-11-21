const mongoose = require("mongoose");

const EmpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    age: {
      type: Number,
      min: 16,
      max: 80,
      default: 25,
    },
    department: {
      type: String,
      enum: ["HR", "IT", "Sales", "Finance"],
      default: "IT",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "employees",
  }
);

// Use "test" database for employees
const testDb = mongoose.connection.useDb("test");

module.exports = testDb.model("Employee", EmpSchema);
