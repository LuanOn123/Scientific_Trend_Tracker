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

exports.listJournals = asyncHandler(async (req, res) => ok(res, { items: await Journal.find().sort({ paperCount: -1 }) }));
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
  const search = req.query.q ? { title: new RegExp(req.query.q, "i") } : {};
  const items = await ResearchPaper.find({ journal: journal.name, sourceName: "semantic_scholar", ...search }).sort({ publicationYear: -1, createdAt: -1 });
  ok(res, { journal, items });
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

exports.listBookmarks = asyncHandler(async (req, res) => ok(res, { items: await Bookmark.find({ userId: req.user._id }).populate("paperId").sort({ createdAt: -1 }) }));
exports.createBookmark = asyncHandler(async (req, res) => {
  const paper = await ResearchPaper.findById(req.body.paperId);
  if (!paper) throw createError(404, "Paper not found");
  const bookmark = await Bookmark.findOneAndUpdate(
    { userId: req.user._id, paperId: req.body.paperId },
    { note: req.body.note, tags: req.body.tags || [] },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate("paperId");
  ok(res, { bookmark }, "Bookmark saved", 201);
});
exports.updateBookmark = asyncHandler(async (req, res) => {
  const bookmark = await Bookmark.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true }).populate("paperId");
  if (!bookmark) throw createError(404, "Bookmark not found");
  ok(res, { bookmark }, "Bookmark updated");
});
exports.deleteBookmark = asyncHandler(async (req, res) => {
  await Bookmark.deleteOne({ _id: req.params.id, userId: req.user._id });
  ok(res, {}, "Bookmark removed");
});

exports.listNotifications = asyncHandler(async (req, res) => ok(res, { items: await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }) }));
exports.readNotification = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true }, { new: true });
  if (!item) throw createError(404, "Notification not found");
  ok(res, { notification: item });
});
exports.readAllNotifications = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id }, { isRead: true });
  ok(res, {}, "All notifications marked as read");
});
