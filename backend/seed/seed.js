require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const ResearchPaper = require("../models/ResearchPaper");
const Journal = require("../models/Journal");
const Keyword = require("../models/Keyword");
const ResearchTopic = require("../models/ResearchTopic");
const PublicationTrend = require("../models/PublicationTrend");
const APIDataSource = require("../models/APIDataSource");
const Notification = require("../models/Notification");
const Bookmark = require("../models/Bookmark");
const DashboardReport = require("../models/DashboardReport");
const Author = require("../models/Author");
const SyncLog = require("../models/SyncLog");
const syncService = require("../services/sync.service");

const keywords = [
  "artificial intelligence",
  "machine learning",
  "deep learning",
  "natural language processing",
  "computer vision",
  "data mining",
  "software engineering",
  "cybersecurity",
  "blockchain",
  "internet of things"
];

const users = [
  ["Admin", "admin@sjtts.com", "admin"],
  ["Researcher", "researcher@sjtts.com", "researcher"],
  ["Lecturer", "lecturer@sjtts.com", "lecturer"],
  ["Student", "student@sjtts.com", "student"]
];

const run = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    ResearchPaper.deleteMany({}),
    Journal.deleteMany({}),
    Keyword.deleteMany({}),
    ResearchTopic.deleteMany({}),
    PublicationTrend.deleteMany({}),
    APIDataSource.deleteMany({}),
    Notification.deleteMany({}),
    Bookmark.deleteMany({}),
    DashboardReport.deleteMany({}),
    Author.deleteMany({}),
    SyncLog.deleteMany({})
  ]);

  const passwordHash = await bcrypt.hash("123456", 10);
  const createdUsers = await User.insertMany(
    users.map(([name, email, role]) => ({
      name,
      email,
      role,
      passwordHash,
      interests: role === "admin" ? [] : ["machine learning", "software engineering"]
    }))
  );

  await APIDataSource.insertMany([
    { name: "OpenAlex", baseUrl: process.env.OPENALEX_BASE_URL || "https://api.openalex.org", apiKeyRequired: false, apiKeyEnvName: "OPENALEX_CONTACT_EMAIL", isEnabled: false, status: "inactive" },
    { name: "Crossref", baseUrl: process.env.CROSSREF_BASE_URL || "https://api.crossref.org", apiKeyRequired: false, apiKeyEnvName: "CROSSREF_MAILTO", isEnabled: false, status: "inactive" },
    { name: "Semantic Scholar", baseUrl: process.env.SEMANTIC_SCHOLAR_BASE_URL || "https://api.semanticscholar.org/graph/v1", apiKeyRequired: true, apiKeyEnvName: "SEMANTIC_SCHOLAR_API_KEY", isEnabled: process.env.SEMANTIC_SCHOLAR_ENABLED === "true", status: process.env.SEMANTIC_SCHOLAR_ENABLED === "true" ? "active" : "inactive" }
  ]);

  let fetchedPapers = [];
  if (process.env.SEMANTIC_SCHOLAR_ENABLED === "true") {
    const seedKeywords = (process.env.DEFAULT_SYNC_KEYWORDS || keywords.slice(0, 4).join(","))
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);
    const log = await syncService.runSync(seedKeywords);
    fetchedPapers = await ResearchPaper.find({ sourceName: "semantic_scholar" }).sort({ createdAt: -1 });
    await DashboardReport.create({
      userId: createdUsers[1]._id,
      title: "Semantic Scholar trend report",
      filters: { sourceName: "semantic_scholar", keywords: seedKeywords },
      summary: { papers: fetchedPapers.length, syncLogId: log._id },
      chartData: []
    });
  } else {
    await SyncLog.create({
      sourceName: "semantic_scholar",
      status: "inactive",
      message: "Semantic Scholar is disabled. Set SEMANTIC_SCHOLAR_ENABLED=true and SEMANTIC_SCHOLAR_API_KEY in .env, then run npm run seed again.",
      totalFetched: 0,
      startedAt: new Date(),
      endedAt: new Date()
    });
  }

  if (fetchedPapers.length) {
    await Bookmark.create({ userId: createdUsers[1]._id, paperId: fetchedPapers[0]._id, note: "Saved from Semantic Scholar", tags: ["semantic-scholar"] });
    await Notification.create({ userId: createdUsers[1]._id, type: "new_paper", title: "Semantic Scholar data loaded", message: `${fetchedPapers.length} real metadata records were fetched.`, relatedKeyword: fetchedPapers[0].keywords?.[0], relatedPaperId: fetchedPapers[0]._id });
  }

  console.log(`Seed completed with ${fetchedPapers.length} Semantic Scholar papers`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error({
    status: error.response?.status,
    message: error.response?.data?.message || error.message
  });
  await mongoose.disconnect();
  process.exit(1);
});
