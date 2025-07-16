import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  set: { type: mongoose.Schema.Types.ObjectId, ref: "Set", default: null },
  room: { type: String, required: true },

  day: {
    type: String,
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    required: true,
  },

  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },

  yearLevel: { type: String, enum: ["1", "2", "3", "4"], required: true },

  semester: {
    type: String,
    required: true,
    enum: ["1st Semester", "2nd Semester", "Summer", "Januarian", "Octoberian"],
  },

  department: { type: String, required: true },
  areaOfStudy: { type: String, required: true },
  academicYear: { type: String, required: true },
});

export default mongoose.model("Schedule", scheduleSchema);
