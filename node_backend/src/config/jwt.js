import jwt from "jsonwebtoken";

const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN,
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.expiresIn,
    }
  );
};

export default jwtConfig;