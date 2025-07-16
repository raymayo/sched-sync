import Schedule from "../models/Schedule.js";
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
      .populate({
        path: "students",
        select: "name yearLevel grades",
        populate: {
          path: "grades", // This will populate the grades field inside students
        },
      });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schedules", error });
  }
};

// Fetch schedules by course ID
export const getSchedulesByCourseId = async (req, res) => {
  const { courseId } = req.query;

  if (!courseId) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: "Invalid Course ID format" });
  }

  try {
    const schedules = await Schedule.find({
      course: new mongoose.Types.ObjectId(courseId), // Ensuring ObjectId format
    })
      .populate("course")
      .populate("teacher", "name email")
      .populate("students", "name email");

    if (schedules.length === 0) {
      return res
        .status(404)
        .json({ message: "No schedules found for this course ID" });
    }

    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ message: "Internal Server Error", error });
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

// Create a new schedule
export const createSchedule = async (req, res) => {
  try {
    console.log("Received request body:", req.body); // Log the request body

    const newSchedule = new Schedule(req.body);
    await newSchedule.save();

    res.status(201).json(newSchedule);
  } catch (error) {
    console.error("Error creating schedule:", error); // Log backend error
    res.status(500).json({ error: error.message || "Error creating schedule" });
  }
};

// Update a schedule
export const updateSchedule = async (req, res) => {
  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updatedSchedule);
  } catch (error) {
    res.status(500).json({ error: "Error updating schedule" });
  }
};

// Fetch schedules based on year level and area of study
export const getSchedulesByCriteria = async (req, res) => {
  try {
    const { yearLevel, areaOfStudy } = req.query;

    if (!yearLevel || !areaOfStudy) {
      return res
        .status(400)
        .json({ message: "Missing yearLevel or areaOfStudy" });
    }

    const schedules = await Schedule.find({ yearLevel, areaOfStudy });

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFilteredSchedule = async (req, res) => {
  try {
    const { yearLevel, areaOfStudy, department } = req.query;

    const query = {};
    if (yearLevel) query.yearLevel = yearLevel;
    if (department) query.department = decodeURIComponent(department).trim(); // Fix encoding
    console.log("MongoDB Query:", query);

    let schedules = await Schedule.find(query)
      .populate("course")
    // .populate("teacher", "name");-

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



// Delete a schedule
export const deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting schedule" });
  }
};



// export const getFilteredSchedule = async (req, res) => {

//   const {  } = req.query;

// }
