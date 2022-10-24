const { StatusCodes } = require("http-status-codes");
const { cloudinary } = require("../utils/cloudinary");

const UploadVideo = async (req, res) => {
  try {
    const fileStr = req.body.data;
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      resource_type: "video",
      upload_preset: "Goinhub-stories",
    });

    res.status(StatusCodes.OK).json({ uploadResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
};
const uploadImage = async (req, res) => {
  try {
    const fileStr = req.body.data;
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: "Goinhub-stories",
    });

    res.status(StatusCodes.OK).json({ uploadResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
};

const uploadUserImage = async (req, res) => {
  try {
    const fileStr = req.body.data;
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: "User-image",
    });

    res.status(StatusCodes.OK).json({ uploadResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
};

const uploadEventImage = async (req, res) => {
  try {
    const fileStr = req.body.data;
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: "Event-image",
    });

    res.status(StatusCodes.OK).json({ uploadResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
};
module.exports = {
  uploadUserImage,
  UploadVideo,
  uploadImage,
  uploadEventImage,
};
