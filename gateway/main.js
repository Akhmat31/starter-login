const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
dotenv.config();

const base = require("./src/base");
const middleware = require("./src/http/middleware/base-middleware-loader");

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet());

// CORS configuration with configurable whitelist
const defaultWhitelist = ["http://localhost:3000", "http://127.0.0.1:3000"];
const whitelist = process.env.CORS_WHITELIST
  ? process.env.CORS_WHITELIST.split(",").map((origin) => origin.trim())
  : defaultWhitelist;

app.use(
  cors({
    origin: whitelist,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-access-token",
      "x-client-origin",
      "x-security-token",
      "x-csrf-token",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(middleware);
app.use(base);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ code: 404, error: "404 - Not Found" });
});

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Gateway service running on port ${PORT}`);
  });
}

module.exports = app;