const analyticsEngine = require("./analyticsEngine.service");
const jobQueue = require("./jobQueue.service");
const notificationEngine = require("./notificationEngine.service");
const recommendation = require("./recommendation.service");
const ingestionPipeline = require("./pipeline/ingestionPipeline.service");

const handlers = {
  metadata_ingestion: async (job) => {
    const ingestion = await ingestionPipeline.ingestMetadata(job.payload);
    const analytics = await analyticsEngine.rebuild({ source: "metadata_ingestion" });
    const recommendations = await recommendation.rebuildAll();
    const notifications = await notificationEngine.notifyForNewPapers(ingestion.createdPapers);
    return { ingestion: { ...ingestion, papers: ingestion.papers.length, createdPapers: ingestion.createdPapers.length }, analytics, recommendations, notifications };
  },
  analytics_rebuild: async () => analyticsEngine.rebuild({ source: "manual_job" }),
  recommendations_rebuild: async () => recommendation.rebuildAll()
};

let timer;
let isRunning = false;

const processNext = async () => {
  if (isRunning) return;
  isRunning = true;
  try {
    const job = await jobQueue.claimNext(Object.keys(handlers));
    if (!job) return;
    try {
      const result = await handlers[job.type](job);
      await jobQueue.complete(job, result);
    } catch (error) {
      await jobQueue.fail(job, error);
    }
  } finally {
    isRunning = false;
  }
};

exports.startWorker = () => {
  if (process.env.WORKER_ENABLED === "false" || timer) return;
  const interval = Number(process.env.WORKER_POLL_MS || 5000);
  timer = setInterval(processNext, interval);
  timer.unref?.();
  processNext();
};

exports.processNext = processNext;
