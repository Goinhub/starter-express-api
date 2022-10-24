const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "{VALUE} is not a valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    role: {
      type: String,
      enum: ["user", "partner", "admin"],
      default: "user",
    },
    verificationToken: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verified: Date,
    passwordToken: String,
    passwordTokenExpirationDate: Date,
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
