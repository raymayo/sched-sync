import Course from '../models/Course.js';

// @desc Get all courses
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
};

// @desc Create a new course
export const createCourse = async (req, res) => {
    try {
        const {
            courseId,
            courseName,
            courseUnit,
            areaOfStudy,
            semester,
            yearLevel,
        } = req.body;

        if (
            !courseId ||
            !courseName ||
            !courseUnit ||
            !areaOfStudy ||
            !semester ||
            !yearLevel
        ) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const existing = await Course.findOne({ courseId });
        if (existing) {
            return res.status(400).json({ error: 'Course ID already exists.' });
        }

        const newCourse = new Course({
            courseId,
            courseName,
            courseUnit,
            areaOfStudy,
            semester,
            yearLevel,
        });

        await newCourse.save();

        res.status(201).json({
            message: 'Course created successfully!',
            course: newCourse,
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// @desc Get filtered courses
export const getFilteredCourses = async (req, res) => {
    try {
        const { yearLevel, areaOfStudy, department, semester } = req.query;
        const query = {};

        if (yearLevel) query.yearLevel = yearLevel;
        if (areaOfStudy) query.areaOfStudy = areaOfStudy;
        if (department) query.department = department;
        if (semester) query.semester = semester;

        const courses = await Course.find(query);

        res.status(200).json({ courses });
    } catch (error) {
        console.error('Error filtering courses:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
