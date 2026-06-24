const Bookmark = require("../models/Bookmark");
const Recommendation = require("../models/Recommendation");
const ResearchPaper = require("../models/ResearchPaper");
const User = require("../models/User");

const contains = (items, term) => items.some((item) => String(item).toLowerCase().includes(term));

const scorePaper = (paper, signals) => {
  const reasons = [];
  let score = 0;
  const terms = signals.map((item) => String(item).toLowerCase()).filter(Boolean);
  for (const term of terms) {
    if (contains(paper.keywords || [], term)) {
      score += 5;
      reasons.push(`Keyword match: ${term}`);
    }
    if (contains(paper.topics || [], term)) {
      score += 4;
      reasons.push(`Topic match: ${term}`);
    }
    if (String(paper.title || "").toLowerCase().includes(term)) {
      score += 3;
      reasons.push(`Title match: ${term}`);
    }
  }
  if ((paper.publicationYear || 0) >= new Date().getFullYear() - 2) {
    score += 2;
    reasons.push("Recent publication");
  }
  if ((paper.citationCount || 0) >= 50) {
    score += 1;
    reasons.push("High citation count");
  }
  return { score, reasons: [...new Set(reasons)].slice(0, 5) };
};

exports.rebuildForUser = async (user) => {
  const bookmarks = await Bookmark.find({ userId: user._id }).populate("paperId");
  const bookmarkSignals = bookmarks.flatMap((bookmark) => [
    ...(bookmark.tags || []),
    ...(bookmark.paperId?.keywords || []),
    ...(bookmark.paperId?.topics || [])
  ]);
  const signals = [...new Set([...(user.interests || []), ...bookmarkSignals].map((item) => String(item).trim()).filter(Boolean))];
  if (!signals.length) return [];

  const bookmarkedIds = bookmarks.map((bookmark) => bookmark.paperId?._id).filter(Boolean);
  const candidates = await ResearchPaper.find({ _id: { $nin: bookmarkedIds } }).sort({ publicationYear: -1, citationCount: -1 }).limit(300);
  const ranked = candidates
    .map((paper) => ({ paper, ...scorePaper(paper, signals) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  await Recommendation.deleteMany({ userId: user._id });
  if (!ranked.length) return [];
  await Recommendation.insertMany(
    ranked.map((item) => ({ userId: user._id, paperId: item.paper._id, score: item.score, reasons: item.reasons })),
    { ordered: false }
  ).catch(() => {});
  return ranked;
};

exports.rebuildAll = async () => {
  const users = await User.find({ isActive: true });
  let total = 0;
  for (const user of users) {
    const items = await exports.rebuildForUser(user);
    total += items.length;
  }
  return { users: users.length, recommendations: total };
};

exports.listForUser = (userId, limit = 10) =>
  Recommendation.find({ userId }).populate({ path: "paperId", select: "-apiRawData" }).sort({ score: -1, updatedAt: -1 }).limit(limit);
