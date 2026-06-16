const router = require("express").Router();
const controller = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");

router.post("/register", validate(controller.registerSchema), controller.register);
router.post("/login", validate(controller.loginSchema), controller.login);
router.post("/google", validate(controller.googleSchema), controller.googleLogin);
router.get("/me", protect, controller.me);
router.post("/logout", controller.logout);

module.exports = router;
