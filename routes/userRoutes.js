const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/auth");
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  upgradeUsertopartner,
  deletePartner,
} = require("../controllers/userController");

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllUsers);
router
  .route("/admin")
  .get(authenticateUser, authorizePermissions("admin"), showCurrentUser);
router.route("/me").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
router
  .route("/upgradeusertopartner")
  .patch(authenticateUser, authorizePermissions("admin"), upgradeUsertopartner);
router
  .route("/deletepartner")
  .patch(authenticateUser, authorizePermissions("admin"), deletePartner);

router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
