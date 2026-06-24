const Notification = require("../models/Notification");
const User = require("../models/User");

const paperTerms = (paper) => [...(paper.keywords || []), ...(paper.topics || []), paper.title || ""].map((item) => String(item).toLowerCase());

exports.notifyForNewPapers = async (papers = []) => {
  const users = await User.find({ isActive: true, interests: { $exists: true, $ne: [] } });
  const notifications = [];

  for (const paper of papers) {
    const terms = paperTerms(paper);
    for (const user of users) {
      const match = (user.interests || []).find((interest) => {
        const normalized = String(interest).toLowerCase();
        return terms.some((term) => term.includes(normalized));
      });
      if (!match) continue;
      notifications.push({
        userId: user._id,
        type: "new_paper",
        title: `New paper for ${match}`,
        message: paper.title,
        relatedKeyword: match,
        relatedPaperId: paper._id
      });
    }
  }

  if (notifications.length) {
    await Notification.insertMany(notifications, { ordered: false }).catch(() => {});
  }
  return { notifications: notifications.length };
};
