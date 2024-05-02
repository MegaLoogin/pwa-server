import { Router } from "express";
import userController from "../controllers/user-controller.js";
import auth from "../middle/auth.js";

export const router = new Router();

router.post("/reg", userController.registration);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/refresh", userController.refresh);

router.get("/test", auth, (req, res, next) => {
    return res.json({"status": "ok"});
});