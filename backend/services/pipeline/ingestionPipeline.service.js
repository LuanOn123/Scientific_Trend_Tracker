const Author = require("../../models/Author");
const Journal = require("../../models/Journal");
const ResearchPaper = require("../../models/ResearchPaper");
const deduplicator = require("./deduplicator.service");
const normalizer = require("./normalizer.service");
const providerRegistry = require("./providerRegistry.service");

const mergePaperData = (existing, incoming) => {
  const updates = {};
  ["doi", "abstract", "journal", "publicationYear", "publicationDate", "sourceUrl"].forEach((field) => {
    if (!existing[field] && incoming[field]) updates[field] = incoming[field];
  });
  if ((incoming.citationCount || 0) > (existing.citationCount || 0)) updates.citationCount = incoming.citationCount;
  if ((!existing.authors || !existing.authors.length) && incoming.authors?.length) updates.authors = incoming.authors;
  if (incoming.keywords?.length) updates.keywords = [...new Set([...(existing.keywords || []), ...incoming.keywords])];
  if (incoming.topics?.length) updates.topics = [...new Set([...(existing.topics || []), ...incoming.topics])];
  updates.apiRawData = { ...(existing.apiRawData || {}), enrichments: { ...(existing.apiRawData?.enrichments || {}), [incoming.sourceName]: incoming.apiRawData } };
  return updates;
};

const indexPaper = async (paper, created) => {
  if (!created) {
    await Journal.updateOne(
      { name: paper.journal || "Unknown journal" },
      { $setOnInsert: { sourceName: paper.sourceName }, $addToSet: { topics: { $each: paper.topics || [] } } },
      { upsert: true }
    );
    return;
  }

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
};

const upsertNormalizedPaper = async (incoming) => {
  const duplicate = await deduplicator.findDuplicate(incoming);
  if (duplicate) {
    Object.assign(duplicate, mergePaperData(duplicate, incoming));
    await duplicate.save();
    await indexPaper(duplicate, false);
    return { paper: duplicate, created: false };
  }
  const created = await ResearchPaper.create(incoming);
  await indexPaper(created, true);
  return { paper: created, created: true };
};

exports.ingestMetadata = async ({ query, yearFrom, yearTo, limit = 10, source = "all" }) => {
  const providers = providerRegistry.resolveProviders(source);
  const providerResults = [];
  const failures = [];

  for (const [providerName, provider] of providers) {
    try {
      const works = await provider.searchWorks({ query, yearFrom, yearTo, limit });
      providerResults.push(...works.map((paper) => ({ providerName, paper })));
    } catch (error) {
      failures.push({ providerName, message: error.response?.data?.message || error.message });
    }
  }

  const saved = [];
  const createdPapers = [];
  let createdCount = 0;
  let enrichedCount = 0;
  for (const item of providerResults) {
    const normalized = normalizer.normalizePaper(item.paper);
    const { paper, created } = await upsertNormalizedPaper(normalized);
    saved.push(paper);
    if (created) {
      createdCount += 1;
      createdPapers.push(paper);
    }
    else enrichedCount += 1;
  }

  return {
    papers: saved,
    createdPapers,
    createdCount,
    enrichedCount,
    fetchedCount: providerResults.length,
    failures
  };
};
