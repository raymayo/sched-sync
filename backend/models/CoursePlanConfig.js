const planConfigSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    academicYear: String,
    semester: String,
    sessionsPerWeek: Number,
    hoursPerDay: Number
});

export default mongoose.model("CoursePlanConfig", planConfigSchema);
