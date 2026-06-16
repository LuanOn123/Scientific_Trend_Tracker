require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use(logger("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => res.json({ success: true, message: "API is healthy", data: { uptime: process.uptime() } }));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/papers", require("./routes/paper.routes"));
app.use("/api/trends", require("./routes/trend.routes"));
app.use("/api/journals", require("./routes/journal.routes"));
app.use("/api/keywords", require("./routes/keyword.routes"));
app.use("/api/topics", require("./routes/topic.routes"));
app.use("/api/bookmarks", require("./routes/bookmark.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

app.use((req, res, next) => next(createError(404)));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
