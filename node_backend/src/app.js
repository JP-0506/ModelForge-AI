import express from "express";
import cookieParser from "cookie-parser";

import corsConfig from "./config/cors.js";
import routes from "./routes/index.js";

import notFound from "./middleware/NotFoundMiddleware.js";
import errorHandler from "./middleware/ErrorMiddleware.js";

const app = express();

// Middleware
app.use(corsConfig);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/", routes);

// 404 Middleware
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;