// models/Set.js
import mongoose from "mongoose";

const setSchema = new mongoose.Schema({
    setName: { type: String, required: true, unique: true }, // e.g., "Set A"
    department: { type: String, required: true },
    areaOfStudy: { type: String, required: true }, // e.g., BSCS
    yearLevel: { type: String, required: true },   // e.g., "1", "2", "3"
    academicYear: { type: String, required: true }, // e.g., "2025-2026"
    semester: { type: String, required: true },     // e.g., "1st Semester"
}, { timestamps: true });



export default mongoose.model("Set", setSchema);
