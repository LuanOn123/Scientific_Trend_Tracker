const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    issn: [String],
    publisher: String,
    paperCount: { type: Number, default: 0 },
    topics: [String],
    sourceName: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Journal", journalSchema);
