const Joi = require("joi");
const createError = require("http-errors");
const ResearchPaper = require("../models/ResearchPaper");
const syncService = require("../services/sync.service");
const trendAnalyzer = require("../services/trendAnalyzer.service");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");

exports.searchSchema = Joi.object({
  q: Joi.string().allow("").empty(""),
  keyword: Joi.string().allow("").empty(""),
  yearFrom: Joi.number().integer().min(1800).empty(""),
  yearTo: Joi.number().integer().min(1800).empty(""),
  journal: Joi.string().allow("").empty(""),
  source: Joi.string().valid("semantic_scholar", "").empty(""),
  fetchExternal: Joi.boolean().default(false),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const makeFilter = (query) => {
  const filter = {};
  const text = query.q || query.keyword;
  if (text) filter.$text = { $search: text };
  if (query.yearFrom || query.yearTo) filter.publicationYear = { ...(query.yearFrom && { $gte: query.yearFrom }), ...(query.yearTo && { $lte: query.yearTo }) };
  if (query.journal) filter.journal = new RegExp(query.journal, "i");
  filter.sourceName = query.source || "semantic_scholar";
  return filter;
};

exports.list = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const [items, total] = await Promise.all([
    ResearchPaper.find({ sourceName: "semantic_scholar" }).sort({ publicationYear: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    ResearchPaper.countDocuments({ sourceName: "semantic_scholar" })
  ]);
  ok(res, { items, total, page, pages: Math.ceil(total / limit) });
});

exports.detail = asyncHandler(async (req, res) => {
  const paper = await ResearchPaper.findById(req.params.id);
  if (!paper) throw createError(404, "Paper not found");
  ok(res, { paper });
});

exports.search = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const filter = makeFilter(req.query);
  let [items, total] = await Promise.all([
    ResearchPaper.find(filter).sort({ publicationYear: -1 }).skip((page - 1) * limit).limit(limit),
    ResearchPaper.countDocuments(filter)
  ]);
  if ((req.query.fetchExternal || !items.length) && (req.query.q || req.query.keyword)) {
    await syncService.searchAndCache({ query: req.query.q || req.query.keyword, yearFrom: req.query.yearFrom, yearTo: req.query.yearTo, limit });
    items = await ResearchPaper.find(filter).sort({ publicationYear: -1 }).skip((page - 1) * limit).limit(limit);
    total = await ResearchPaper.countDocuments(filter);
  }
  ok(res, { items, total, page, pages: Math.ceil(total / limit) });
});

exports.sync = asyncHandler(async (req, res) => {
  const keywords = req.body.keywords || (process.env.DEFAULT_SYNC_KEYWORDS || "").split(",").map((item) => item.trim()).filter(Boolean);
  const log = await syncService.runSync(keywords);
  await trendAnalyzer.rebuildTrends();
  ok(res, { log }, "Sync completed");
});
