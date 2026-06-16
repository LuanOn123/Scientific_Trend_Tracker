const router = require("express").Router();
const controller = require("../controllers/admin.controller");
const { protect, allowRoles } = require("../middlewares/auth.middleware");

router.use(protect, allowRoles("admin"));
router.get("/users", controller.users);
router.patch("/users/:id/status", controller.updateUserStatus);
router.patch("/users/:id/role", controller.updateUserRole);
router.get("/data-sources", controller.dataSources);
router.post("/data-sources", controller.createDataSource);
router.patch("/data-sources/:id", controller.updateDataSource);
router.post("/sync/run", controller.runSync);
router.get("/sync/logs", controller.syncLogs);

module.exports = router;
