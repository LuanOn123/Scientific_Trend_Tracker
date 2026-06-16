const axios = require("axios");

const invertedIndexToText = (index) => {
  if (!index) return "";
  const words = [];
  Object.entries(index).forEach(([word, positions]) => {
    positions.forEach((position) => {
      words[position] = word;
    });
  });
  return words.join(" ");
};

exports.searchWorks = async ({ query, yearFrom, yearTo, limit = 20 }) => {
  if (process.env.OPENALEX_ENABLED === "false") return [];
  const filters = [];
  if (yearFrom) filters.push(`from_publication_date:${yearFrom}-01-01`);
  if (yearTo) filters.push(`to_publication_date:${yearTo}-12-31`);

  const response = await axios.get(`${process.env.OPENALEX_BASE_URL || "https://api.openalex.org"}/works`, {
    params: {
      search: query,
      filter: filters.join(",") || undefined,
      per_page: limit,
      mailto: process.env.OPENALEX_CONTACT_EMAIL
    }
  });

  return (response.data.results || []).map((work) => ({
    externalId: work.id,
    doi: work.doi,
    title: work.title || "Untitled paper",
    abstract: invertedIndexToText(work.abstract_inverted_index),
    authors: (work.authorships || []).map((item) => ({
      name: item.author?.display_name,
      externalId: item.author?.id,
      affiliation: item.institutions?.[0]?.display_name
    })),
    journal: work.primary_location?.source?.display_name || "Unknown journal",
    publicationYear: work.publication_year,
    publicationDate: work.publication_date ? new Date(work.publication_date) : undefined,
    keywords: (work.keywords || []).map((keyword) => keyword.display_name).filter(Boolean),
    topics: (work.concepts || []).slice(0, 5).map((concept) => concept.display_name).filter(Boolean),
    citationCount: work.cited_by_count || 0,
    sourceName: "openalex",
    sourceUrl: work.id,
    apiRawData: work
  }));
};
