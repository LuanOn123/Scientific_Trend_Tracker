const axios = require("axios");

let lastRequestAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForRateLimit = async () => {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < 2200) await sleep(2200 - elapsed);
  lastRequestAt = Date.now();
};

const semanticRequest = async (path, options, attempt = 1) => {
  await waitForRateLimit();
  try {
    return await axios.get(`${process.env.SEMANTIC_SCHOLAR_BASE_URL || "https://api.semanticscholar.org/graph/v1"}${path}`, options);
  } catch (error) {
    if (error.response?.status === 429 && attempt < 6) {
      const retryAfter = Number(error.response.headers?.["retry-after"]);
      await sleep(Number.isFinite(retryAfter) ? retryAfter * 1000 : 3000 * attempt);
      return semanticRequest(path, options, attempt + 1);
    }
    throw error;
  }
};

exports.searchWorks = async ({ query, yearFrom, yearTo, limit = 10 }) => {
  if (process.env.SEMANTIC_SCHOLAR_ENABLED !== "true") return [];
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY?.trim();
  const response = await semanticRequest("/paper/search", {
    headers: apiKey ? { "x-api-key": apiKey } : {},
    params: {
      query,
      limit,
      year: yearFrom || yearTo ? `${yearFrom || ""}-${yearTo || ""}` : undefined,
      fields: "title,abstract,authors,venue,year,publicationDate,citationCount,url,externalIds,fieldsOfStudy"
    }
  });

  return (response.data.data || []).map((paper) => ({
    externalId: paper.paperId,
    doi: paper.externalIds?.DOI,
    title: paper.title || "Untitled paper",
    abstract: paper.abstract,
    authors: (paper.authors || []).map((author) => ({ name: author.name, externalId: author.authorId })),
    journal: paper.venue || "Unknown journal",
    publicationYear: paper.year,
    publicationDate: paper.publicationDate ? new Date(paper.publicationDate) : undefined,
    keywords: paper.fieldsOfStudy || [],
    topics: paper.fieldsOfStudy || [],
    citationCount: paper.citationCount || 0,
    sourceName: "semantic_scholar",
    sourceUrl: paper.url,
    apiRawData: paper
  }));
};
