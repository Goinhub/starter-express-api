const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide event name"],
      maxlength: [250, "Name can not be more than 250 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide event ticket price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide event description"],
      maxlength: [1000, "Description can not be more than 1000 characters"],
    },
    location: {
      type: String,
      required: [true, "Please provide event location"],
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: [true, "Please provide event category"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    NumberOfPlaces: {
      type: Number,
      required: true,
      default: 50,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
