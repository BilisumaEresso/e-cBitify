const express = require("express");
const connectMongoDb = require("./config/mongoDb");
const cors = require("cors");
const helmet = require("helmet");
const { authRoute, categoryRoute, productRouter, orderRouter, cartRouter, aiRouter, adminRouter } = require("./router");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./controller/notFound");
// initialize cloudinary (reads from .env)
require("./config/cloudinary");

const app = express();

// Security headers (helmet must come first)
app.use(helmet());
 
// CORS — only allow your frontend origin.
// Set FRONTEND_URL in your .env (e.g. http://localhost:5173 for dev)
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server requests (no origin) and listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/ai", aiRouter);

// Connect DB
connectMongoDb();

// Health check
app.get("/_health", (req, res) => res.json({ status: "ok" }));

// Not found + error handler (must be last)
app.use("", notFound);
app.use(errorHandler);

module.exports = app;
