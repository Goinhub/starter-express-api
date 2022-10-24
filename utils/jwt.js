const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

const isTokenValid = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { user } });
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

  const fifteenMinutes = 1000 * 60 * 15;
  const month = 1000 * 60 * 60 * 24 * 30;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    signed: true,
    expires: new Date(Date.now() + fifteenMinutes),
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    signed: true,
    expires: new Date(Date.now() + month),
  });
};

module.exports = { attachCookiesToResponse, createJWT, isTokenValid };
