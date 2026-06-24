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
  citationMin: Joi.number().integer().min(0).empty(""),
  citationMax: Joi.number().integer().min(0).empty(""),
  author: Joi.string().allow("").empty(""),
  topic: Joi.string().allow("").empty(""),
  journal: Joi.string().allow("").empty(""),
  source: Joi.string().valid("semantic_scholar", "openalex", "crossref", "all", "").empty(""),
  sort: Joi.string().valid("newest", "oldest", "most_cited", "least_cited", "relevance").default("newest"),
  fetchExternal: Joi.boolean().default(false),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const makeFilter = (query) => {
  const filter = {};
  const text = query.q || query.keyword;
  if (text) filter.$text = { $search: text };
  if (query.yearFrom || query.yearTo) filter.publicationYear = { ...(query.yearFrom && { $gte: query.yearFrom }), ...(query.yearTo && { $lte: query.yearTo }) };
  if (query.citationMin || query.citationMax) filter.citationCount = { ...(query.citationMin !== undefined && { $gte: query.citationMin }), ...(query.citationMax !== undefined && { $lte: query.citationMax }) };
  if (query.journal) filter.journal = new RegExp(escapeRegExp(query.journal), "i");
  if (query.author) filter["authors.name"] = new RegExp(escapeRegExp(query.author), "i");
  if (query.topic) {
    const topicRegex = new RegExp(escapeRegExp(query.topic), "i");
    filter.$and = [...(filter.$and || []), { $or: [{ topics: topicRegex }, { keywords: topicRegex }] }];
  }
  if (query.source && query.source !== "all") filter.sourceName = query.source;
  return filter;
};

const makeSort = (query) => {
  if (query.sort === "oldest") return { publicationYear: 1, publicationDate: 1, createdAt: 1 };
  if (query.sort === "most_cited") return { citationCount: -1, publicationYear: -1, createdAt: -1 };
  if (query.sort === "least_cited") return { citationCount: 1, publicationYear: -1, createdAt: -1 };
  if (query.sort === "relevance" && (query.q || query.keyword)) return { score: { $meta: "textScore" }, citationCount: -1 };
  return { publicationYear: -1, publicationDate: -1, createdAt: -1 };
};

exports.list = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const [items, total] = await Promise.all([
    ResearchPaper.find({ sourceName: "semantic_scholar" }).select("-apiRawData").sort({ publicationYear: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    ResearchPaper.countDocuments({ sourceName: "semantic_scholar" })
  ]);
  ok(res, { items, total, page, limit, pages: Math.max(Math.ceil(total / limit), 1) });
});

exports.detail = asyncHandler(async (req, res) => {
  const paper = await ResearchPaper.findById(req.params.id).select("-apiRawData");
  if (!paper) throw createError(404, "Paper not found");
  ok(res, { paper });
});

exports.search = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const filter = makeFilter(req.query);
  const sort = makeSort(req.query);
  let [items, total] = await Promise.all([
    ResearchPaper.find(filter, sort.score ? { score: { $meta: "textScore" } } : undefined).select("-apiRawData").sort(sort).skip((page - 1) * limit).limit(limit),
    ResearchPaper.countDocuments(filter)
  ]);
  if ((req.query.fetchExternal || !items.length) && (req.query.q || req.query.keyword)) {
    await syncService.searchAndCache({ query: req.query.q || req.query.keyword, yearFrom: req.query.yearFrom, yearTo: req.query.yearTo, limit, source: req.query.source || "semantic_scholar" });
    items = await ResearchPaper.find(filter, sort.score ? { score: { $meta: "textScore" } } : undefined).select("-apiRawData").sort(sort).skip((page - 1) * limit).limit(limit);
    total = await ResearchPaper.countDocuments(filter);
  }
  ok(res, { items, total, page, limit, pages: Math.max(Math.ceil(total / limit), 1) });
});

exports.sync = asyncHandler(async (req, res) => {
  const keywords = req.body.keywords || (process.env.DEFAULT_SYNC_KEYWORDS || "").split(",").map((item) => item.trim()).filter(Boolean);
  const log = await syncService.runSync(keywords);
  await trendAnalyzer.rebuildTrends();
  ok(res, { log }, "Sync completed");
});
