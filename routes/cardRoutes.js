const express = require("express");
const router = express.Router();

const {
  createCard,
  getCurrentUserCard,
  updateCard,
  getAllcards,
  changepin,
  getpin,
} = require("../controllers/cardController");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/auth");

router.route("/createCard").post(authenticateUser, createCard);
router.route("/getCurrentUserCard").get(authenticateUser, getCurrentUserCard);
router.route("/getAllCards").get(authenticateUser, getAllcards);
router.route("/updateCard").patch(authenticateUser, updateCard);
router.route("/changepin").patch(authenticateUser, changepin);
router.route("/getpin").post(authenticateUser, getpin);

module.exports = router;
