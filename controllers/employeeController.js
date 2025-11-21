const Employee = require("../models/employee");

// GET ALL
exports.getAll = async (req, res, next) => {
  try {
    const {
      minSalary,
      maxSalary,
      department,
      sortBy = "createdAt",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (minSalary || maxSalary) {
      filter.salary = {};
      if (minSalary) filter.salary.$gte = Number(minSalary);
      if (maxSalary) filter.salary.$lte = Number(maxSalary);
    }

    if (department) filter.department = department;

    const employees = await Employee.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res
      .status(200)
      .json({ page, limit, count: employees.length, data: employees });
  } catch (err) {
    next(err);
  }
};

// GET ONE
exports.getOne = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).lean();
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

// CREATE
exports.create = async (req, res, next) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({
      message: "Employee created successfully",
      data: employee,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: err.errors,
      });
    }
    next(err);
  }
};

// UPDATE
exports.update = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.status(200).json({
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: err.errors,
      });
    }
    next(err);
  }
};

// DELETE (hard delete)
exports.remove = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.status(200).json({
      message: "Employee deleted successfully",
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

// ========== UI CONTROLLERS ==========

// HOME — Show all employees with pagination
exports.showHome = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Employee.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const employees = await Employee.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.render("employees/index", {
      layout: "employee",
      employees,
      currentPage: page,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
      limit,
    });
  } catch (err) {
    console.error("Error loading employees:", err);
    res.status(500).send("Error loading employees");
  }
};

// FORM: FIND
exports.showFindForm = async (req, res, next) => {
  try {
    if (req.method === "GET")
      return res.render("employees/find", { layout: "employee", employee: null });

    const employee = await Employee.findById(req.body.id).lean();

    if (!employee)
      return res.render("employees/find", {
        layout: "employee",
        error: "No employee found",
        employee: null,
      });

    res.render("employees/find", { layout: "employee", employee });
  } catch (err) {
    next(err);
  }
};

// FORM: ADD
exports.showAddForm = async (req, res, next) => {
  try {
    if (req.method === "GET")
      return res.render("employees/add", { layout: "employee" });

    const newEmployee = await Employee.create(req.body);
    res.render("employees/add", {
      layout: "employee",
      success: "Employee added successfully!",
    });
  } catch (err) {
    res.render("employees/add", {
      layout: "employee",
      error: err.message || "Error adding employee",
    });
  }
};

// FORM: UPDATE
exports.showUpdateForm = async (req, res, next) => {
  try {
    if (req.method === "GET")
      return res.render("employees/update", {
        layout: "employee",
        employee: null,
      });

    const updated = await Employee.findByIdAndUpdate(
      req.body.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!updated)
      return res.render("employees/update", {
        layout: "employee",
        error: "No employee found",
        employee: null,
      });

    res.render("employees/update", {
      layout: "employee",
      success: "Employee updated successfully!",
      employee: updated,
    });
  } catch (err) {
    res.render("employees/update", {
      layout: "employee",
      error: err.message || "Error updating employee",
      employee: null,
    });
  }
};

// FORM: DELETE
exports.showDeleteForm = async (req, res, next) => {
  try {
    if (req.method === "GET")
      return res.render("employees/delete", { layout: "employee" });

    const deleted = await Employee.findByIdAndDelete(req.body.id);

    if (!deleted)
      return res.render("employees/delete", {
        layout: "employee",
        error: "No employee found to delete",
      });

    res.render("employees/delete", {
      layout: "employee",
      success: "Employee deleted successfully",
    });
  } catch (err) {
    res.render("employees/delete", {
      layout: "employee",
      error: err.message || "Error deleting employee",
    });
  }
};