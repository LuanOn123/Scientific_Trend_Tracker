const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const createError = require("http-errors");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");

exports.registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  interests: Joi.array().items(Joi.string()).default([])
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

exports.googleSchema = Joi.object({
  credential: Joi.string().required()
});

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "dev_secret", { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, interests: user.interests });
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) throw createError(409, "Email already registered");
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({ name: req.body.name, email: req.body.email, passwordHash, role: "user", interests: req.body.interests });
  const token = signToken(user);
  ok(res, { token, user: publicUser(user) }, "Registered successfully", 201);
});

exports.login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) throw createError(401, "Incorrect email or password.");
  if (!user.isActive) throw createError(403, "Account is inactive");
  const token = signToken(user);
  res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  ok(res, { token, user: publicUser(user) }, "Logged in successfully");
});

exports.googleLogin = asyncHandler(async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) throw createError(500, "Google login is not configured");
  const ticket = await googleClient.verifyIdToken({
    idToken: req.body.credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();
  if (!payload?.email || !payload.email_verified) throw createError(401, "Google account is not verified");

  let user = await User.findOne({ email: payload.email.toLowerCase() });
  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      avatar: payload.picture,
      role: "user",
      passwordHash: await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10),
      interests: []
    });
  } else if (payload.picture && !user.avatar) {
    user.avatar = payload.picture;
    await user.save();
  }
  if (!user.isActive) throw createError(403, "Account is inactive");

  const token = signToken(user);
  res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  ok(res, { token, user: publicUser(user) }, "Logged in with Google");
});

exports.me = asyncHandler(async (req, res) => ok(res, { user: publicUser(req.user) }));

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  ok(res, {}, "Logged out successfully");
});
