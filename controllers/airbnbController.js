const Airbnb = require("../models/airbnb");

// GET ALL (API)
exports.getAll = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "price";

    const airbnbs = await Airbnb.find()
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({ page, limit, count: airbnbs.length, data: airbnbs });
  } catch (err) {
    next(err);
  }
};

// GET ONE (API)
exports.getOne = async (req, res, next) => {
  try {
    const searchId = req.params.id.trim();

    // First try to find by custom 'id' field (string ID)
    let listing = await Airbnb.findOne({ id: searchId }).lean();

    // If not found and searchId looks like MongoDB ObjectId, try _id
    if (!listing && /^[0-9a-fA-F]{24}$/.test(searchId)) {
      try {
        listing = await Airbnb.findById(searchId).lean();
      } catch (err) {
        // Invalid ObjectId format, continue
      }
    }

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (err) {
    next(err);
  }
};

// CREATE (API) - Add new Airbnb listing
exports.create = async (req, res, next) => {
  try {
    // Validate required fields
    if (!req.body.NAME || !req.body.price) {
      return res.status(400).json({
        message: "Validation Error",
        errors: "NAME and price are required fields",
      });
    }

    // Create new listing
    const newListing = await Airbnb.create(req.body);

    // Return created listing with 201 status
    res.status(201).json({
      message: "Listing created successfully",
      data: newListing,
    });
  } catch (err) {
    // Handle validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: err.errors,
      });
    }
    next(err);
  }
};

// UPDATE (API) - Update existing Airbnb listing
exports.update = async (req, res, next) => {
  try {
    const updated =
      (await Airbnb.findOneAndUpdate(
        { id: req.params.id },
        { $set: req.body },
        { new: true, runValidators: true }
      ).lean()) ||
      (await Airbnb.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).lean());

    if (!updated)
      return res.status(404).json({ message: "Listing not found" });

    res.status(200).json({
      message: "Listing updated successfully",
      data: updated,
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

// DELETE (API) - Delete Airbnb listing
exports.delete = async (req, res, next) => {
  try {
    const deleted =
      (await Airbnb.findOneAndDelete({ id: req.params.id })) ||
      (await Airbnb.findByIdAndDelete(req.params.id));

    if (!deleted)
      return res.status(404).json({ message: "Listing not found" });

    res.status(200).json({
      message: "Listing deleted successfully",
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};

// HOME — Show all listings with pagination
exports.showHome = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Airbnb.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const airbnbs = await Airbnb.find().skip(skip).limit(limit).lean();

    res.render("airbnb/index", {
      layout: "airbnb",
      airbnbs,
      currentPage: page,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
      limit,
    });
  } catch (err) {
    console.error("Error loading listings:", err);
    res.status(500).send("Error loading listings");
  }
};

// FORM: FIND
exports.showFindForm = async (req, res, next) => {
  try {
    if (req.method === "GET")
      return res.render("airbnb/find", { layout: "airbnb", listing: null });

    const searchId = req.body.id.trim();

    // First try to find by custom 'id' field (string ID)
    let listing = await Airbnb.findOne({ id: searchId }).lean();

    // If not found and searchId looks like MongoDB ObjectId, try _id
    if (!listing && /^[0-9a-fA-F]{24}$/.test(searchId)) {
      try {
        listing = await Airbnb.findById(searchId).lean();
      } catch (err) {
        // Invalid ObjectId format, continue
      }
    }

    if (!listing)
      return res.render("airbnb/find", {
        layout: "airbnb",
        error: "No listing found with that ID",
        listing: null,
      });

    res.render("airbnb/find", { layout: "airbnb", listing });
  } catch (err) {
    next(err);
  }
};

// FORM: ADD
exports.showAddForm = async (req, res, next) => {
  try {
    if (req.method === "GET")
      return res.render("airbnb/add", { layout: "airbnb" });
    const newListing = await Airbnb.create(req.body);
    res.render("airbnb/add", {
      layout: "airbnb",
      success: "Listing added successfully!",
    });
  } catch (err) {
    res.render("airbnb/add", {
      layout: "airbnb",
      error: "Error adding listing",
    });
  }
};

// FORM: UPDATE
exports.showUpdateForm = async (req, res, next) => {
  try {
    if (req.method === "GET")
      return res.render("airbnb/update", { layout: "airbnb", listing: null });

    const updated =
      (await Airbnb.findOneAndUpdate(
        { id: req.body.id },
        { $set: { NAME: req.body.NAME, price: req.body.price } },
        { new: true, runValidators: true }
      ).lean()) ||
      (await Airbnb.findByIdAndUpdate(
        req.body.id,
        { $set: { NAME: req.body.NAME, price: req.body.price } },
        { new: true, runValidators: true }
      ).lean());

    if (!updated)
      return res.render("airbnb/update", {
        layout: "airbnb",
        error: "No listing found",
        listing: null,
      });

    res.render("airbnb/update", {
      layout: "airbnb",
      success: "Listing updated successfully!",
      listing: updated,
    });
  } catch (err) {
    next(err);
  }
};

// FORM: DELETE
exports.showDeleteForm = async (req, res, next) => {
  try {
    if (req.method === "GET")
      return res.render("airbnb/delete", { layout: "airbnb" });

    const deleted =
      (await Airbnb.findOneAndDelete({ id: req.body.id })) ||
      (await Airbnb.findByIdAndDelete(req.body.id));

    if (!deleted)
      return res.render("airbnb/delete", {
        layout: "airbnb",
        error: "No listing found to delete",
      });

    res.render("airbnb/delete", {
      layout: "airbnb",
      success: "Listing deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
