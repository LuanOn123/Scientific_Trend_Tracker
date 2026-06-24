const ResearchPaper = require("../../models/ResearchPaper");

const titleKey = (title) => String(title || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

exports.findDuplicate = async (paper) => {
  const candidates = [
    paper.externalId && { externalId: paper.externalId, sourceName: paper.sourceName },
    paper.doi && { doi: paper.doi }
  ].filter(Boolean);
  if (candidates.length) {
    const byId = await ResearchPaper.findOne({ $or: candidates });
    if (byId) return byId;
  }

  if (!paper.doi && paper.title && paper.publicationYear) {
    const sameYear = await ResearchPaper.find({ publicationYear: paper.publicationYear, journal: paper.journal }).limit(25);
    return sameYear.find((item) => titleKey(item.title) === titleKey(paper.title));
  }

  return null;
};
