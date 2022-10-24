const Event = require("../models/Event");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const getAllEventsStatic = async (req, res) => {
  const events = await Event.find({});

  res.status(200).json({ events, nbHits: events.length });
};
const getAllEvents = async (req, res) => {
  const { category, dateRange, location, priceRange } = req.query;

  const queryObject = {};
  if (category) {
    queryObject.category = { $in: category.split(",") };
  }
  if (location) {
    queryObject.location = { $in: location.split(",") };
  }
  if (dateRange) {
    queryObject.date = {
      $gte: dateRange.split(",")[0],
      $lte: dateRange.split(",")[1],
    };
  }

  if (priceRange) {
    queryObject.price = {
      $gte: Number(priceRange.split(",")[0]),
      $lte: Number(priceRange.split(",")[1]),
    };
  }
  let result = Event.find(queryObject);

  // const page = Number(req.query.page) || 1;
  // const limit = Number(req.query.limit) || 10;
  // const skip = (page - 1) * limit;

  // result = result.skip(skip).limit(limit);

  const events = await result;
  res.status(200).json({ events, nbHits: events.length });
};

const createEvent = async (req, res) => {
  // req.body.user = req.user.userId;
  const {
    NumberOfPlaces,
    image,
    category,
    date,
    location,
    description,
    price,
    name,
  } = req.body;
  const event = await Event.create({
    NumberOfPlaces,
    image,
    category,
    date,
    location,
    description,
    price,
    name,
    user: req.user.userId,
  });
  event.save();
  res.status(StatusCodes.CREATED).json({ event });
};

const getSingleEvent = async (req, res) => {
  const { id: eventId } = req.params;

  const event = await Event.findOne({ _id: eventId });

  if (!event) {
    throw new CustomError.NotFoundError(`No event with id : ${eventId}`);
  }

  res.status(StatusCodes.OK).json({ event });
};

const getCurrentUserEvents = async (req, res) => {
  const events = await Event.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ events, count: events.length });
};

const updateEvent = async (req, res) => {
  const { id: eventId } = req.params;

  const event = await Event.findOneAndUpdate({ _id: eventId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!event) {
    throw new CustomError.NotFoundError(`No event with id : ${eventId}`);
  }

  res.status(StatusCodes.OK).json({ event });
};

const deleteEvent = async (req, res) => {
  const { id: eventId } = req.params;

  const event = await Event.findOne({ _id: eventId });

  if (!event) {
    throw new CustomError.NotFoundError(`No event with id : ${eventId}`);
  }

  await event.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! event removed." });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No File Uploaded");
  }
  const eventImage = req.files.image;

  if (!eventImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please Upload Image");
  }

  const maxSize = 1024 * 1024;

  if (eventImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload image smaller than 1MB"
    );
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${eventImage.name}`
  );
  await eventImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${eventImage.name}` });
};

module.exports = {
  createEvent,
  getAllEvents,
  getAllEventsStatic,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  uploadImage,
  getCurrentUserEvents,
};
