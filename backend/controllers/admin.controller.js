const createError = require("http-errors");
const User = require("../models/User");
const APIDataSource = require("../models/APIDataSource");
const SyncLog = require("../models/SyncLog");
const syncService = require("../services/sync.service");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");

exports.users = asyncHandler(async (req, res) => ok(res, { items: await User.find().select("-passwordHash").sort({ createdAt: -1 }) }));
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select("-passwordHash");
  if (!user) throw createError(404, "User not found");
  ok(res, { user });
});
exports.updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select("-passwordHash");
  if (!user) throw createError(404, "User not found");
  ok(res, { user });
});
exports.dataSources = asyncHandler(async (req, res) => ok(res, { items: await APIDataSource.find().sort({ name: 1 }) }));
exports.createDataSource = asyncHandler(async (req, res) => ok(res, { item: await APIDataSource.create(req.body) }, "Data source created", 201));
exports.updateDataSource = asyncHandler(async (req, res) => {
  const item = await APIDataSource.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) throw createError(404, "Data source not found");
  ok(res, { item });
});
exports.runSync = asyncHandler(async (req, res) => {
  const keywords = req.body.keywords || (process.env.DEFAULT_SYNC_KEYWORDS || "").split(",").map((item) => item.trim()).filter(Boolean);
  ok(res, { log: await syncService.runSync(keywords) }, "Sync completed");
});
exports.syncLogs = asyncHandler(async (req, res) => ok(res, { items: await SyncLog.find().sort({ startedAt: -1 }).limit(100) }));
