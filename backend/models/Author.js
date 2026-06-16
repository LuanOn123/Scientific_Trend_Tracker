const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    externalId: String,
    affiliation: String,
    paperCount: { type: Number, default: 0 },
    citationCount: { type: Number, default: 0 },
    topics: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Author", authorSchema);
