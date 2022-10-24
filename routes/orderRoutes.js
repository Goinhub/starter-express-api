const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/auth");

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  getAllCostumers,
  getPartnerCostumers,
  verifyOrder,
  editamount,
  deleteOrder,
} = require("../controllers/orderController");

router
  .route("/")
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions("admin"), getAllOrders);

router.route("/my-orders").get(authenticateUser, getCurrentUserOrders);
router
  .route("/allcostumers")
  .get(authenticateUser, authorizePermissions("admin"), getAllCostumers);
router
  .route("/partnercostumers")
  .get(authenticateUser, authorizePermissions("partner"), getPartnerCostumers);
router
  .route("/verifyorder")
  .post(
    authenticateUser,
    authorizePermissions("partner", "admin"),
    verifyOrder
  );

router
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

router
  .route("/editamount")
  .patch(
    authenticateUser,
    authorizePermissions("partner", "admin"),
    editamount
  );
router
  .route("/deleteorder")
  .delete(
    authenticateUser,
    authorizePermissions("partner", "admin"),
    deleteOrder
  );

module.exports = router;
