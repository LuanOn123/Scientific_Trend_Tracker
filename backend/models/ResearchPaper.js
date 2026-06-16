const mongoose = require("mongoose");

const researchPaperSchema = new mongoose.Schema(
  {
    externalId: { type: String, index: true },
    doi: { type: String, index: true },
    title: { type: String, required: true, text: true },
    abstract: String,
    authors: [{ name: String, externalId: String, affiliation: String }],
    journal: { type: String, index: true },
    publicationYear: { type: Number, index: true },
    publicationDate: Date,
    keywords: [{ type: String, index: true }],
    topics: [{ type: String, index: true }],
    citationCount: { type: Number, default: 0 },
    sourceName: { type: String, enum: ["openalex", "crossref", "semantic_scholar"], required: true },
    sourceUrl: String,
    apiRawData: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

researchPaperSchema.index({ title: "text", abstract: "text", keywords: "text", topics: "text" });
researchPaperSchema.index({ externalId: 1, sourceName: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("ResearchPaper", researchPaperSchema);
