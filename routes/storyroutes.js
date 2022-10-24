const express = require("express");
const router = express.Router();

const {
  createStory,
  getAllstories,
  getCurrentUserStories,
  deletestory,
} = require("../controllers/storyController");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/auth");

router
  .route("/createstory")
  .post(
    authenticateUser,
    authorizePermissions("admin", "partner"),
    createStory
  );
router
  .route("/deletestory")
  .post(
    authenticateUser,
    authorizePermissions("admin", "partner"),
    deletestory
  );
router
  .route("/getCurrentUserStories")
  .get(
    authenticateUser,
    authorizePermissions("admin", "partner"),
    getCurrentUserStories
  );
router.route("/getAllstories").get(authenticateUser, getAllstories);

module.exports = router;
