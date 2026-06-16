const cron = require("node-cron");
const syncService = require("../services/sync.service");

exports.startSyncJob = () => {
  const expression = process.env.SYNC_CRON || "0 2 * * *";
  if (!cron.validate(expression)) {
    console.warn(`Invalid SYNC_CRON: ${expression}`);
    return;
  }
  cron.schedule(expression, async () => {
    const keywords = (process.env.DEFAULT_SYNC_KEYWORDS || "").split(",").map((item) => item.trim()).filter(Boolean);
    if (!keywords.length) return;
    try {
      await syncService.runSync(keywords);
    } catch (error) {
      console.error("Scheduled sync failed:", error.message);
    }
  });
};
