exports.normalizePaper = (paper) => ({
  ...paper,
  doi: paper.doi ? String(paper.doi).replace(/^https?:\/\/doi.org\//i, "").trim() : undefined,
  title: String(paper.title || "Untitled paper").trim(),
  journal: String(paper.journal || "Unknown journal").trim() || "Unknown journal",
  authors: (paper.authors || []).filter((author) => author?.name).map((author) => ({
    name: String(author.name).trim(),
    externalId: author.externalId,
    affiliation: author.affiliation
  })),
  keywords: [...new Set((paper.keywords || []).map((item) => String(item).trim()).filter(Boolean))],
  topics: [...new Set((paper.topics || []).map((item) => String(item).trim()).filter(Boolean))],
  citationCount: Number(paper.citationCount || 0)
});
