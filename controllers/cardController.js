const { StatusCodes } = require("http-status-codes");
const Card = require("../models/Card");
const User = require("../models/User");

const createCard = async (req, res) => {
  const { age, name, phone, occupation, city, adress } = req.body;
  const pin = Math.floor(1000 + Math.random() * 9000);
  const card = await Card.create({
    age,
    name,
    phone,
    user: req.user.userId,
    occupation,
    city,
    pin,
    adress,
  });

  await card.save();
  res.status(StatusCodes.CREATED).json({ msg: "Card Created" });
};

const changepin = async (req, res) => {
  const { pin } = req.body;
  const card = await Card.findOne({ user: req.user.userId });
  card.pin = pin;
  await card.save();
  res.status(StatusCodes.CREATED).json({ msg: "Pin Changed" });
};

const getpin = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  const password = req.body;
  if (user.password !== password) {
    throw new CustomError.BadRequestError("password is not valid");
  } else {
    const card = await Card.findOne({ user: req.user.userId });
    res.status(StatusCodes.CREATED).json({ pin: card.pin });
  }
};

const getCurrentUserCard = async (req, res) => {
  const card = await Card.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ card });
};

const updateCard = async (req, res) => {
  const { phone, occupation, city, adress } = req.body;

  const card = await Card.findOne({ user: req.user.userId });

  if (phone) {
    card.phone = phone;
  }
  if (adress) {
    card.adress = adress;
  }
  if (city) {
    card.city = city;
  }
  if (occupation) {
    card.occupation = occupation;
  }

  await card.save();
  res.status(StatusCodes.OK).json({ card });
};
const getAllcards = async (req, res) => {
  const cards = await Card.find({});
  res.status(StatusCodes.OK).json({ cards, count: cards.length });
};

module.exports = {
  createCard,
  getCurrentUserCard,
  updateCard,
  getAllcards,
  changepin,
  getpin,
};
