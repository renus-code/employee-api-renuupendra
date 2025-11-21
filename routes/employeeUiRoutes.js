const express = require("express");
const router = express.Router();
const controller = require("../controllers/employeeController");

// UI routes
router.get("/", controller.showHome);
router
  .route("/find")
  .get(controller.showFindForm)
  .post(controller.showFindForm);
router.route("/add").get(controller.showAddForm).post(controller.showAddForm);
router
  .route("/update")
  .get(controller.showUpdateForm)
  .post(controller.showUpdateForm);
router
  .route("/delete")
  .get(controller.showDeleteForm)
  .post(controller.showDeleteForm);

module.exports = router;
