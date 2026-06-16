const ResearchPaper = require("../models/ResearchPaper");
const Keyword = require("../models/Keyword");
const ResearchTopic = require("../models/ResearchTopic");
const PublicationTrend = require("../models/PublicationTrend");

const trendScore = (years) => {
  const sorted = [...years].sort((a, b) => a.year - b.year);
  const latest = sorted.at(-1)?.count || 0;
  const previous = sorted.at(-2)?.count || 0;
  if (!previous) return latest > 0 ? 100 : 0;
  return Math.round(((latest - previous) / previous) * 100);
};

exports.rebuildTrends = async () => {
  const paperYear = { $ifNull: ["$publicationYear", { $year: "$publicationDate" }] };
  const byKeyword = await ResearchPaper.aggregate([
    { $unwind: "$keywords" },
    { $group: { _id: { name: { $toLower: "$keywords" }, year: paperYear }, count: { $sum: 1 } } },
    { $sort: { "_id.year": 1 } }
  ]);
  const byTopic = await ResearchPaper.aggregate([
    { $unwind: "$topics" },
    { $group: { _id: { name: "$topics", year: paperYear }, count: { $sum: 1 } } },
    { $sort: { "_id.year": 1 } }
  ]);
  const byJournal = await ResearchPaper.aggregate([
    { $group: { _id: { journal: "$journal", year: paperYear }, count: { $sum: 1 } } }
  ]);

  await Keyword.deleteMany({});
  await ResearchTopic.deleteMany({});
  await PublicationTrend.deleteMany({});

  const keywordMap = new Map();
  byKeyword.forEach((item) => {
    const key = item._id.name;
    if (!keywordMap.has(key)) keywordMap.set(key, []);
    keywordMap.get(key).push({ year: item._id.year, count: item.count });
  });
  await Keyword.insertMany(
    [...keywordMap.entries()].map(([name, years]) => ({
      name,
      normalizedName: name.toLowerCase(),
      paperCount: years.reduce((sum, year) => sum + year.count, 0),
      trendScore: trendScore(years),
      years
    })),
    { ordered: false }
  ).catch(() => {});

  const topicMap = new Map();
  byTopic.forEach((item) => {
    const key = item._id.name;
    if (!topicMap.has(key)) topicMap.set(key, []);
    topicMap.get(key).push({ year: item._id.year, count: item.count });
  });
  await ResearchTopic.insertMany(
    [...topicMap.entries()].map(([name, years]) => ({
      name,
      description: `Trend analysis for ${name}`,
      keywords: [name],
      paperCount: years.reduce((sum, year) => sum + year.count, 0),
      trendScore: trendScore(years),
      years
    })),
    { ordered: false }
  ).catch(() => {});

  const trendDocs = [
    ...byKeyword.map((item) => ({ keyword: item._id.name, year: item._id.year, count: item.count, sourceName: "mixed" })),
    ...byTopic.map((item) => ({ topic: item._id.name, year: item._id.year, count: item.count, sourceName: "mixed" })),
    ...byJournal.map((item) => ({ journal: item._id.journal, year: item._id.year, count: item.count, sourceName: "mixed" }))
  ].filter((item) => item.year);
  if (trendDocs.length) await PublicationTrend.insertMany(trendDocs);
};

exports.getSeries = async (filter) => PublicationTrend.find(filter).sort({ year: 1, month: 1 });

exports.getEmerging = async () => {
  const keywords = await Keyword.find({ paperCount: { $lte: 200 } }).sort({ trendScore: -1 }).limit(10);
  const topics = await ResearchTopic.find({ paperCount: { $lte: 200 } }).sort({ trendScore: -1 }).limit(10);
  return { keywords, topics };
};
