const express = require("express");
const {
  uploadImage,
  UploadVideo,
  uploadUserImage,
} = require("../controllers/uploadController");
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/auth");
router
  .route("/uploadimage")
  .post(
    authenticateUser,
    authorizePermissions("admin", "partner"),
    uploadImage
  );
router
  .route("/uploadvideo")
  .post(
    authenticateUser,
    authorizePermissions("admin", "partner"),
    UploadVideo
  );
router.route("/uploaduserimage").post(authenticateUser, uploadUserImage);
router
  .route("/uploadeventimage")
  .post(
    authenticateUser,
    authorizePermissions("admin", "partner"),
    uploadUserImage
  );
module.exports = router;
