import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const isUserAvailable = async (req, res, next) => {
  let { token } = req.cookies;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decodedToken.id);

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Error verifying token:", err);
    req.user = null;
    next();
  }
};

export { isUserAvailable };
