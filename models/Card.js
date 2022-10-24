const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide event name"],
      maxlength: [250, "Name can not be more than 250 characters"],
    },
    age: {
      type: String,
      required: [true, "Please provide your age"],
      maxlength: [2, "age can not be more than 2 characters"],
    },
    phone: {
      type: String,
      required: [true, "Please provide your phone number"],
      maxlength: [12, "age can not be more than 10 characters"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    occupation: {
      type: String,
      required: [true, "Please provide your occupation"],
      maxlength: [20, "occupation can not be more than 20 characters"],
    },
    city: {
      type: String,
      required: [true, "Please provide your city"],
      maxlength: [20, "city can not be more than 20 characters"],
    },
    adress: {
      type: String,
      required: false,
      maxlength: [60, "adress can not be more than 60 characters"],
    },
    pin: {
      type: String,
      required: true,
      maxlength: [4, "pin can not be more than 4 characters"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", CardSchema);
