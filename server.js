require("dotenv").config();
require("express-async-errors");
// express

const express = require("express");
const app = express();
app.use(
  express.json({
    limit: "50mb",
  })
);
// rest of the packages
const cookieParser = require("cookie-parser");
// const fileUpload = require("express-fileupload");
// const rateLimiter = require('express-rate-limit');
// const helmet = require('helmet');
// const xss = require('xss-clean');
const cors = require("cors");
const proxy = require("pass-cors");
app.use("/proxy", proxy);
// const mongoSanitize = require('express-mongo-sanitize');

// database
const connectDB = require("./config/db");

//  routers
const authRouter = require("./routes/authRoutes");
const eventsRouter = require("./routes/eventRoutes");
const userRouter = require("./routes/userRoutes");
const orderRouter = require("./routes/orderRoutes");
const cardRouter = require("./routes/cardRoutes");
const uploadRouter = require("./routes/uploadRoutes");
const storyRouter = require("./routes/storyroutes");

// middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const { logout } = require("./controllers/authController");
const { StatusCodes } = require("http-status-codes");

// app.set('trust proxy', 1);
// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000,
//     max: 60,
//   })
// );
// app.use(helmet());

const whitelist = [
  "https://goinhub-test.netlify.app",
  "http://localhost:3000",
  "https://goihub-client.vercel.app",
];

const corsOptions = {
  origin: whitelist,
  credentials: true,
};
app.use(cors(corsOptions));
// app.use(xss());
// app.use(mongoSanitize());
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

// app.use(express.static('./public'));
// app.use(fileUpload());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/card", cardRouter);
app.use("/api/v1/story", storyRouter);
app.use("/api/v1/upload", uploadRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
