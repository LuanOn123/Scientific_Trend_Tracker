const semanticScholar = require("../semanticScholar.service");
const openAlex = require("../openAlex.service");
const crossref = require("../crossref.service");

const providers = {
  semantic_scholar: semanticScholar,
  openalex: openAlex,
  crossref
};

exports.resolveProviders = (source = "semantic_scholar") => {
  if (source === "all") return Object.entries(providers);
  return [[providers[source] ? source : "semantic_scholar", providers[source] || semanticScholar]];
};
