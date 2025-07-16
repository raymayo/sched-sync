import express from 'express';
import {
    getAllCourses,
    createCourse,
    getFilteredCourses,
} from '../controllers/courseController.js';

const router = express.Router();

router.get('/', getAllCourses);           // GET /api/courses
router.post('/', createCourse);           // POST /api/courses
router.get('/filter', getFilteredCourses); // GET /api/courses/filter

export default router;
