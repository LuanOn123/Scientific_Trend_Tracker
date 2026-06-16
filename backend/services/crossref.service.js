const axios = require("axios");

exports.searchWorks = async ({ query, yearFrom, yearTo, limit = 10 }) => {
  if (process.env.CROSSREF_ENABLED === "false") return [];
  const response = await axios.get(`${process.env.CROSSREF_BASE_URL || "https://api.crossref.org"}/works`, {
    params: {
      query,
      rows: limit,
      mailto: process.env.CROSSREF_MAILTO,
      filter: [yearFrom ? `from-pub-date:${yearFrom}` : "", yearTo ? `until-pub-date:${yearTo}` : ""].filter(Boolean).join(",") || undefined
    }
  });

  return (response.data.message?.items || []).map((item) => {
    const dateParts = item.published?.["date-parts"]?.[0] || item.created?.["date-parts"]?.[0] || [];
    const year = dateParts[0];
    const date = year ? new Date(dateParts[0], (dateParts[1] || 1) - 1, dateParts[2] || 1) : undefined;
    return {
      externalId: item.URL || item.DOI,
      doi: item.DOI,
      title: item.title?.[0] || "Untitled paper",
      abstract: item.abstract,
      authors: (item.author || []).map((author) => ({ name: [author.given, author.family].filter(Boolean).join(" ") })),
      journal: item["container-title"]?.[0] || "Unknown journal",
      publicationYear: year,
      publicationDate: date,
      keywords: item.subject || [],
      topics: item.subject || [],
      citationCount: item["is-referenced-by-count"] || 0,
      sourceName: "crossref",
      sourceUrl: item.URL,
      apiRawData: item
    };
  });
};
