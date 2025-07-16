import express from "express";
import { autoGenerateSchedule } from "../controllers/autoSchedController.js";

const router = express.Router();

router.post("/", autoGenerateSchedule);

export default router;