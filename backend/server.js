/* eslint-disable no-undef */
import express from "express";
// import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
// import authRoutes from "./src/backend/routes/authRoutes.js";
// import courseRoutes from "./src/backend/routes/courseRoutes.js";
// import userRoutes from "./src/backend/routes/userRoutes.js";
// import studentRoutes from "./src/backend/routes/studentRoutes.js";
// import gradeRoutes from "./src/backend/routes/gradeRoutes.js";
// import setRoutes from "./src/backend/routes/setRoutes.js";
// import searchRoutes from "./src/backend/routes/manageGradeRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import roomRoutes from "./routes/roomRoutes.js"
import courseRoutes from "./routes/courseRoutes.js"
import autoSchedRoutes from './routes/autoSchedRoutes.js'
// dotenv.config();

mongoose
    .connect('mongodb://localhost:27017/sched-sync')
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/rooms', roomRoutes)
app.use('/api/courses', courseRoutes)
app.use("/api/schedules", scheduleRoutes);
app.use("/api/auto-schedule", autoSchedRoutes);
// app.use("/api/auth", authRoutes);


// app.use("/api/courses", courseRoutes);

// app.use("/api/users", userRoutes);

// app.use("/api/student", studentRoutes);

// app.use("/api/grades", gradeRoutes);

// app.use("/api/sets", setRoutes);

// app.use("/api/schedule/", searchRoutes)

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
