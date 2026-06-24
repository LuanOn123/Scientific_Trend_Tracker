const createError = require("http-errors");
const Journal = require("../models/Journal");
const Keyword = require("../models/Keyword");
const ResearchTopic = require("../models/ResearchTopic");
const Bookmark = require("../models/Bookmark");
const Notification = require("../models/Notification");
const ResearchPaper = require("../models/ResearchPaper");
const PublicationTrend = require("../models/PublicationTrend");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const { pagePayload, parsePagination } = require("../utils/pagination");

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.listJournals = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { limit: 12 });
  const q = String(req.query.q || "").trim();
  const filter = q ? { $or: [{ name: new RegExp(escapeRegExp(q), "i") }, { topics: new RegExp(escapeRegExp(q), "i") }] } : {};
  const [items, total] = await Promise.all([
    Journal.find(filter).sort({ paperCount: -1 }).skip(skip).limit(limit),
    Journal.countDocuments(filter)
  ]);
  ok(res, pagePayload({ items, total, page, limit }));
});
exports.journalDetail = asyncHandler(async (req, res) => {
  const item = await Journal.findById(req.params.id);
  if (!item) throw createError(404, "Journal not found");
  ok(res, { journal: item });
});
exports.journalTrends = asyncHandler(async (req, res) => {
  const journal = await Journal.findById(req.params.id);
  if (!journal) throw createError(404, "Journal not found");
  ok(res, { series: await PublicationTrend.find({ journal: journal.name }).sort({ year: 1 }) });
});
exports.journalPapers = asyncHandler(async (req, res) => {
  const journal = await Journal.findById(req.params.id);
  if (!journal) throw createError(404, "Journal not found");
  const { page, limit, skip } = parsePagination(req.query, { limit: 10 });
  const q = String(req.query.q || "").trim();
  const search = q ? { $or: [{ title: new RegExp(escapeRegExp(q), "i") }, { keywords: new RegExp(escapeRegExp(q), "i") }, { topics: new RegExp(escapeRegExp(q), "i") }] } : {};
  const filter = { journal: journal.name, ...search };
  const [items, total] = await Promise.all([
    ResearchPaper.find(filter).select("-apiRawData").sort({ publicationYear: -1, createdAt: -1 }).skip(skip).limit(limit),
    ResearchPaper.countDocuments(filter)
  ]);
  ok(res, pagePayload({ items, total, page, limit, extra: { journal } }));
});

exports.listKeywords = asyncHandler(async (req, res) => ok(res, { items: await Keyword.find().sort({ name: 1 }) }));
exports.popularKeywords = asyncHandler(async (req, res) => ok(res, { items: await Keyword.find().sort({ paperCount: -1 }).limit(20) }));
exports.keywordTrends = asyncHandler(async (req, res) => ok(res, { series: await PublicationTrend.find({ keyword: new RegExp(req.params.keyword, "i") }).sort({ year: 1 }) }));
exports.followKeyword = asyncHandler(async (req, res) => {
  await req.user.updateOne({ $addToSet: { interests: req.body.keyword } });
  ok(res, { keyword: req.body.keyword }, "Keyword followed");
});
exports.unfollowKeyword = asyncHandler(async (req, res) => {
  await req.user.updateOne({ $pull: { interests: req.params.keyword } });
  ok(res, { keyword: req.params.keyword }, "Keyword unfollowed");
});

exports.listTopics = asyncHandler(async (req, res) => ok(res, { items: await ResearchTopic.find().sort({ name: 1 }) }));
exports.popularTopics = asyncHandler(async (req, res) => ok(res, { items: await ResearchTopic.find().sort({ paperCount: -1 }).limit(20) }));
exports.emergingTopics = asyncHandler(async (req, res) => ok(res, { items: await ResearchTopic.find().sort({ trendScore: -1 }).limit(20) }));

const cleanTags = (tags = []) => [...new Set(tags.map((tag) => String(tag || "").trim()).filter(Boolean))];
const cleanCollection = (collection) => String(collection || "General").trim() || "General";
const serializeBookmark = (bookmark) => {
  const item = bookmark.toObject ? bookmark.toObject() : bookmark;
  return { ...item, collection: item.collectionName || item.collection || "General" };
};

exports.listBookmarks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { limit: 10 });
  const selectedCollection = String(req.query.collection || "").trim();
  const filter = { userId: req.user._id, ...(selectedCollection && selectedCollection !== "all" && { collectionName: selectedCollection }) };
  const [items, total, allCollections] = await Promise.all([
    Bookmark.find(filter).populate({ path: "paperId", select: "-apiRawData" }).sort({ collectionName: 1, createdAt: -1 }).skip(skip).limit(limit),
    Bookmark.countDocuments(filter),
    Bookmark.find({ userId: req.user._id }).select("collectionName")
  ]);
  const serialized = items.map(serializeBookmark);
  const collections = [...new Set(allCollections.map((item) => item.collectionName || "General"))].sort((a, b) => a.localeCompare(b));
  ok(res, pagePayload({ items: serialized, total, page, limit, extra: { collections } }));
});
exports.createBookmark = asyncHandler(async (req, res) => {
  const paper = await ResearchPaper.findById(req.body.paperId);
  if (!paper) throw createError(404, "Paper not found");
  const bookmark = await Bookmark.findOneAndUpdate(
    { userId: req.user._id, paperId: req.body.paperId },
    { collectionName: cleanCollection(req.body.collection), note: req.body.note, tags: cleanTags(req.body.tags) },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate({ path: "paperId", select: "-apiRawData" });
  ok(res, { bookmark: serializeBookmark(bookmark) }, "Bookmark saved", 201);
});
exports.updateBookmark = asyncHandler(async (req, res) => {
  const updates = {
    ...(req.body.collection !== undefined && { collectionName: cleanCollection(req.body.collection) }),
    ...(req.body.note !== undefined && { note: req.body.note }),
    ...(req.body.tags !== undefined && { tags: cleanTags(req.body.tags) })
  };
  const bookmark = await Bookmark.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, updates, { new: true }).populate({ path: "paperId", select: "-apiRawData" });
  if (!bookmark) throw createError(404, "Bookmark not found");
  ok(res, { bookmark: serializeBookmark(bookmark) }, "Bookmark updated");
});
exports.deleteBookmark = asyncHandler(async (req, res) => {
  await Bookmark.deleteOne({ _id: req.params.id, userId: req.user._id });
  ok(res, {}, "Bookmark removed");
});

exports.listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { limit: 10 });
  const filter = { userId: req.user._id };
  const [items, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter)
  ]);
  ok(res, pagePayload({ items, total, page, limit }));
});
exports.readNotification = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true }, { new: true });
  if (!item) throw createError(404, "Notification not found");
  ok(res, { notification: item });
});
exports.readAllNotifications = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id }, { isRead: true });
  ok(res, {}, "All notifications marked as read");
});
