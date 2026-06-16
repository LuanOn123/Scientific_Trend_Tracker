const ResearchPaper = require("../models/ResearchPaper");
const Journal = require("../models/Journal");
const Keyword = require("../models/Keyword");
const ResearchTopic = require("../models/ResearchTopic");
const PublicationTrend = require("../models/PublicationTrend");
const trendAnalyzer = require("../services/trendAnalyzer.service");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");

const yearRange = (query) => ({
  ...(query.yearFrom || query.yearTo
    ? { year: { ...(query.yearFrom && { $gte: Number(query.yearFrom) }), ...(query.yearTo && { $lte: Number(query.yearTo) }) } }
    : {})
});

exports.overview = asyncHandler(async (req, res) => {
  const [totalPapers, totalJournals, totalKeywords, totalTopics, byYear, topKeywords, topJournals, emerging] = await Promise.all([
    ResearchPaper.countDocuments(),
    Journal.countDocuments(),
    Keyword.countDocuments(),
    ResearchTopic.countDocuments(),
    ResearchPaper.aggregate([{ $group: { _id: "$publicationYear", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Keyword.find().sort({ paperCount: -1 }).limit(10),
    Journal.find().sort({ paperCount: -1 }).limit(10),
    trendAnalyzer.getEmerging()
  ]);
  ok(res, {
    totals: { totalPapers, totalJournals, totalKeywords, totalTopics },
    papersByYear: byYear.map((item) => ({ year: item._id, count: item.count })),
    topKeywords,
    topJournals,
    emerging
  });
});

exports.byKeyword = asyncHandler(async (req, res) => ok(res, { series: await trendAnalyzer.getSeries({ keyword: new RegExp(req.query.keyword || "", "i"), ...yearRange(req.query) }) }));
exports.byTopic = asyncHandler(async (req, res) => ok(res, { series: await trendAnalyzer.getSeries({ topic: new RegExp(req.query.topic || "", "i"), ...yearRange(req.query) }) }));
exports.byJournal = asyncHandler(async (req, res) => ok(res, { series: await trendAnalyzer.getSeries({ journal: new RegExp(req.query.journal || "", "i"), ...yearRange(req.query) }) }));
exports.emerging = asyncHandler(async (req, res) => ok(res, await trendAnalyzer.getEmerging()));

exports.keywordYearMatrix = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 6), 10);
  const requestedKeywords = String(req.query.keywords || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const yearFilter = yearRange(req.query);
  const keywords = requestedKeywords.length
    ? requestedKeywords
    : (await Keyword.find().sort({ paperCount: -1 }).limit(limit)).map((item) => item.name.toLowerCase());

  const rows = await PublicationTrend.find({
    keyword: { $in: keywords },
    ...yearFilter
  }).sort({ year: 1 });

  const yearMap = new Map();
  rows.forEach((row) => {
    if (!yearMap.has(row.year)) yearMap.set(row.year, { year: row.year });
    yearMap.get(row.year)[row.keyword] = row.count;
  });

  const chartData = [...yearMap.values()].map((item) => {
    keywords.forEach((keyword) => {
      if (item[keyword] === undefined) item[keyword] = 0;
    });
    return item;
  });

  ok(res, { keywords, chartData });
});
