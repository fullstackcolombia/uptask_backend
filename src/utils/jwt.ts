import jwt from "jsonwebtoken";
import { Types } from "mongoose";

type userPayload = {
  id: Types.ObjectId;
};

export const generateJWT = (data: userPayload) => {
  const token = jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};
