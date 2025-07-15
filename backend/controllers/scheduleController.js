import Schedule from "../models/Schedule.js";
// import User from "../models/User.js";
import mongoose from "mongoose";

export const getSchedules = async (req, res) => {
  const { yearLevel, department, courseId, teacher } = req.query;

  try {
    let query = {};

    if (yearLevel) {
      query["yearLevel"] = yearLevel.trim();
    }
    if (department) {
      query["department"] = department.trim();
    }
    if (courseId) {
      query["course"] = new mongoose.Types.ObjectId(courseId);
    }
    if (teacher !== undefined && teacher !== null && teacher !== "") {
      query["teacher"] = new mongoose.Types.ObjectId(teacher);
    } else {
      query["teacher"] = { $ne: null, $exists: true };
    }

    const schedules = await Schedule.find(query)
      .populate("course")
    // .populate({
    //   path: "students",
    //   select: "name yearLevel grades",
    //   populate: {
    //     path: "grades", // This will populate the grades field inside students
    //   },
    // });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schedules", error });
  }
};



// Fetch all schedules without populating (raw data)
export const getRawSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate("course"); // ✅ Populate course details
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: "Error fetching raw schedules" });
  }
};




// Fetch schedules based on year level and area of study

export const getFilteredSchedule = async (req, res) => {
  try {
    const { yearLevel, areaOfStudy, department } = req.query;

    const query = {};
    if (yearLevel) query.yearLevel = yearLevel;
    if (department) query.department = decodeURIComponent(department).trim(); // Fix encoding
    console.log("MongoDB Query:", query);

    let schedules = await Schedule.find(query)
      .populate("course")
      .populate("teacher", "name");

    console.log("Populated Schedules:", schedules);

    if (areaOfStudy) {
      schedules = schedules.filter(
        (schedule) => schedule.course?.areaOfStudy === areaOfStudy,
      );
    }

    res.json(schedules);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching schedules", error: err.message });
  }
};


