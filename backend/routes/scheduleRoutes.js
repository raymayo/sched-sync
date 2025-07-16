import express from "express";
import {
    getSchedules,
    getRawSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,

    getSchedulesByCourseId,
    getFilteredSchedule,
} from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/", getSchedules);
router.get("/raw", getRawSchedules);
// router.get("/", getSchedulesByCriteria);

router.get("/filter", getFilteredSchedule);
router.get("/by-course", getSchedulesByCourseId);

router.post("/", createSchedule);

router.put("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

export default router;
