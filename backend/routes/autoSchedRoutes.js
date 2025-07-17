import express from "express";
import { autoGenerateSchedule, saveGeneratedSchedule, getFullAvailability } from "../controllers/autoSchedController.js";

const router = express.Router();

router.post("/", autoGenerateSchedule);
router.post("/save", saveGeneratedSchedule);
router.get("/availability", getFullAvailability);

export default router;