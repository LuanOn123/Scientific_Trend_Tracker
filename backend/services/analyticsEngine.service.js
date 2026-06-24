const DashboardReport = require("../models/DashboardReport");
const ResearchPaper = require("../models/ResearchPaper");
const trendAnalyzer = require("./trendAnalyzer.service");

exports.rebuild = async ({ source = "pipeline" } = {}) => {
  await trendAnalyzer.rebuildTrends();
  const [totals, papersByYear, topSources] = await Promise.all([
    ResearchPaper.aggregate([{ $group: { _id: null, papers: { $sum: 1 }, citations: { $sum: "$citationCount" } } }]),
    ResearchPaper.aggregate([{ $group: { _id: "$publicationYear", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ResearchPaper.aggregate([{ $group: { _id: "$sourceName", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
  ]);

  await DashboardReport.create({
    userId: "000000000000000000000000",
    title: "System analytics snapshot",
    filters: { source },
    summary: totals[0] || { papers: 0, citations: 0 },
    chartData: { papersByYear, topSources }
  }).catch(() => {});

  return {
    papers: totals[0]?.papers || 0,
    citations: totals[0]?.citations || 0,
    yearBuckets: papersByYear.length,
    sources: topSources
  };
};
