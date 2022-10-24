const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/auth");

const {
  createEvent,
  getAllEvents,
  getAllEventsStatic,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  uploadImage,
  getCurrentUserEvents,
} = require("../controllers/eventController");

router.route("/").post(createEvent).get(getAllEvents);
router.route("/static").get(getAllEventsStatic);

router
  .route("/:id")
  .get(getSingleEvent)
  .patch(
    authenticateUser,
    authorizePermissions("admin", "partner"),
    updateEvent
  )
  .delete(
    authenticateUser,
    authorizePermissions("admin", "partner"),
    deleteEvent
  );

// router
//   .route("/uploadImage")
//   .post([authenticateUser, authorizePermissions("admin")], uploadImage);
router
  .route("/currentUserEvents")
  .post(
    authenticateUser,
    authorizePermissions("partner", "admin"),
    getCurrentUserEvents
  );

module.exports = router;
