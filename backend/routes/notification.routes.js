const router = require("express").Router();
const controller = require("../controllers/resource.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/", protect, controller.listNotifications);
router.patch("/read-all", protect, controller.readAllNotifications);
router.patch("/:id/read", protect, controller.readNotification);

module.exports = router;
