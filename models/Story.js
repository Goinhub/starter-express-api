const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Please provide image"],
    },
    user_image: {
      type: String,
      required: false,
    },
    link: {
      type: String,
      required: false,
    },
    video: {
      type: String,
      required: false,
    },
    is_video: {
      type: Boolean,
      required: [true, "Please provide info"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Story", StorySchema);
