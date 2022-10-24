const { StatusCodes } = require("http-status-codes");
const Story = require("../models/Story");

const createStory = async (req, res) => {
  const { username, is_video, video, image, user_image, link } = req.body;
  const story = await Story.create({
    username,
    is_video,
    video,
    image,
    link,
    user_image,
    user: req.user.userId,
  });

  await story.save();
  res.status(StatusCodes.CREATED).json({ msg: "story Created" });
};
const getCurrentUserStories = async (req, res) => {
  const stories = await Story.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ stories, count: stories.length });
};
const getAllstories = async (req, res) => {
  const stories = await Story.find({});
  res.status(StatusCodes.OK).json({ stories, count: stories.length });
};
const deletestory = async (req, res) => {
  const { storyId } = req.body;
  await Story.deleteOne({ _id: storyId });
  res.status(StatusCodes.OK).json({ msg: "Story deleted" });
};

module.exports = {
  createStory,
  getCurrentUserStories,
  getAllstories,
  deletestory,
};
