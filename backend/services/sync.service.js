const ResearchPaper = require("../models/ResearchPaper");
const Journal = require("../models/Journal");
const Author = require("../models/Author");
const Notification = require("../models/Notification");
const SyncLog = require("../models/SyncLog");
const User = require("../models/User");
const semanticScholar = require("./semanticScholar.service");
const trendAnalyzer = require("./trendAnalyzer.service");

const upsertPaper = async (paper) => {
  const existing = await ResearchPaper.findOne({
    $or: [
      { externalId: paper.externalId, sourceName: paper.sourceName },
      ...(paper.doi ? [{ doi: paper.doi }] : [])
    ]
  });
  if (existing) return { paper: existing, created: false };
  const created = await ResearchPaper.create(paper);
  await Journal.updateOne(
    { name: paper.journal || "Unknown journal" },
    { $setOnInsert: { sourceName: paper.sourceName }, $inc: { paperCount: 1 }, $addToSet: { topics: { $each: paper.topics || [] } } },
    { upsert: true }
  );
  await Promise.all(
    (paper.authors || []).filter((a) => a.name).map((author) =>
      Author.updateOne(
        { name: author.name },
        { $setOnInsert: { externalId: author.externalId, affiliation: author.affiliation }, $inc: { paperCount: 1, citationCount: paper.citationCount || 0 }, $addToSet: { topics: { $each: paper.topics || [] } } },
        { upsert: true }
      )
    )
  );
  return { paper: created, created: true };
};

exports.searchAndCache = async ({ query, yearFrom, yearTo, limit = 20 }) => {
  const results = await semanticScholar.searchWorks({ query, yearFrom, yearTo, limit: Math.min(limit, 10) });
  const saved = [];
  for (const paper of results) {
    const { paper: savedPaper } = await upsertPaper(paper);
    saved.push(savedPaper);
  }
  if (saved.length) await trendAnalyzer.rebuildTrends();
  return saved;
};

exports.runSync = async (keywords) => {
  const startedAt = new Date();
  const log = await SyncLog.create({ sourceName: "semantic_scholar", status: "running", message: "Semantic Scholar sync started", startedAt });
  try {
    const unique = new Map();
    const failures = [];
    for (const keyword of keywords) {
      try {
        const papers = await exports.searchAndCache({ query: keyword, limit: 10 });
        papers.forEach((paper) => unique.set(String(paper._id), { paper, keyword }));
      } catch (error) {
        failures.push(`${keyword}: ${error.response?.status || ""} ${error.response?.data?.message || error.message}`.trim());
      }
    }
    const entries = [...unique.values()];
    for (const { paper, keyword } of entries) {
      const users = await User.find({ interests: { $regex: new RegExp(`^${keyword}$`, "i") }, isActive: true });
      await Notification.insertMany(
        users.map((user) => ({
          userId: user._id,
          type: "new_paper",
          title: `New paper for ${keyword}`,
          message: paper.title,
          relatedKeyword: keyword,
          relatedPaperId: paper._id
        })),
        { ordered: false }
      ).catch(() => {});
    }
    log.status = failures.length ? "partial_success" : "success";
    log.message = failures.length ? `Sync completed with ${failures.length} failed keyword(s): ${failures.join(" | ")}` : "Sync completed";
    log.totalFetched = entries.length;
    log.endedAt = new Date();
    await log.save();
    return log;
  } catch (error) {
    log.status = "error";
    log.message = error.response?.data?.message || error.message;
    log.endedAt = new Date();
    await log.save();
    throw error;
  }
};
