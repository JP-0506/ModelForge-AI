import cors from "cors";

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

export default cors(corsOptions);