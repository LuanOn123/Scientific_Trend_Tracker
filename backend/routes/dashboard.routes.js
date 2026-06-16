const router = require("express").Router();
const controller = require("../controllers/dashboard.controller");
const { protect, allowRoles } = require("../middlewares/auth.middleware");

router.get("/summary", protect, controller.summary);
router.get("/researcher", protect, allowRoles("researcher", "admin"), controller.researcher);
router.get("/basic", protect, controller.basic);

module.exports = router;
