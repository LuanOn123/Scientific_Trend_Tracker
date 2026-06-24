const createError = require("http-errors");
const User = require("../models/User");
const APIDataSource = require("../models/APIDataSource");
const SyncLog = require("../models/SyncLog");
const jobQueue = require("../services/jobQueue.service");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const { pagePayload, parsePagination } = require("../utils/pagination");

exports.users = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { limit: 10 });
  const [items, total] = await Promise.all([
    User.find().select("-passwordHash").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments()
  ]);
  ok(res, pagePayload({ items, total, page, limit }));
});
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
  const jobs = await Promise.all(
    keywords.map((keyword) => jobQueue.enqueue("metadata_ingestion", {
      query: keyword,
      source: req.body.source || "all",
      limit: req.body.limit || 10,
      yearFrom: req.body.yearFrom,
      yearTo: req.body.yearTo
    }))
  );
  ok(res, { jobs }, `${jobs.length} ingestion job(s) queued`, 202);
});
exports.syncLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { limit: 10 });
  const [items, total] = await Promise.all([
    SyncLog.find().sort({ startedAt: -1 }).skip(skip).limit(limit),
    SyncLog.countDocuments()
  ]);
  ok(res, pagePayload({ items, total, page, limit }));
});
exports.jobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { limit: 10 });
  const filter = { ...(req.query.status && { status: req.query.status }), ...(req.query.type && { type: req.query.type }) };
  const [items, total] = await Promise.all([
    jobQueue.list({ ...filter, skip, limit }),
    jobQueue.count(filter)
  ]);
  ok(res, pagePayload({ items, total, page, limit }));
});
