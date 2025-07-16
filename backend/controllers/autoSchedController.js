// controllers/scheduleController.js
import Schedule from "../models/Schedule.js";

const getAllTimeSlots = () => [
    { startTime: 800, endTime: 830 },
    { startTime: 830, endTime: 900 },
    { startTime: 900, endTime: 930 },
    { startTime: 930, endTime: 1000 },
    { startTime: 1000, endTime: 1030 },
    { startTime: 1030, endTime: 1100 },
    { startTime: 1100, endTime: 1130 },
    { startTime: 1130, endTime: 1200 },
    { startTime: 1300, endTime: 1330 },
    { startTime: 1330, endTime: 1400 },
    { startTime: 1400, endTime: 1430 },
    { startTime: 1430, endTime: 1500 },
    { startTime: 1500, endTime: 1530 },
    { startTime: 1530, endTime: 1600 },
    { startTime: 1600, endTime: 1630 },
    { startTime: 1630, endTime: 1700 },
    { startTime: 1700, endTime: 1730 },
    { startTime: 1730, endTime: 1800 },
    { startTime: 1800, endTime: 1830 },
    { startTime: 1830, endTime: 1900 },
    { startTime: 1900, endTime: 1930 },
    { startTime: 1930, endTime: 2000 },
    { startTime: 2000, endTime: 2030 },
    { startTime: 2030, endTime: 2100 },
];

const isOverlapping = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

function findAvailableBlock({ room, day, requiredSlots, existingSchedules, scheduleSoFar = [] }) {
    const fullSlots = getAllTimeSlots();

    for (let i = 0; i <= fullSlots.length - requiredSlots; i++) {
        const block = fullSlots.slice(i, i + requiredSlots);
        const start = block[0].startTime;
        const end = block[requiredSlots - 1].endTime;

        const hasConflict = [...existingSchedules, ...scheduleSoFar].some(
            (sched) =>
                sched.room === room &&
                sched.day === day &&
                isOverlapping(start, end, sched.startTime, sched.endTime)
        );

        if (!hasConflict) return { startTime: start, endTime: end };
    }

    return null;
}

export const autoGenerateSchedule = async (req, res) => {
    const { set, courses, rooms } = req.body;

    if (!set || !Array.isArray(courses) || !Array.isArray(rooms)) {
        return res.status(400).json({ message: "Missing or invalid fields." });
    }

    try {
        const existingSchedules = await Schedule.find({
            academicYear: set.academicYear,
            semester: set.semester,
        });

        const generated = [];

        const dayPairs = [
            ["Mon", "Thu"],
            ["Tue", "Fri"],
        ];

        for (let index = 0; index < courses.length; index++) {
            const course = courses[index];
            const sessionsNeeded = course.sessionsPerWeek;
            const requiredSlots = (course.hoursPerDay * 60) / 30;

            // Alternate day-pair based on index (0 → Mon/Thu, 1 → Tue/Fri, 2 → Mon/Thu, etc.)
            const [day1, day2] = dayPairs[index % dayPairs.length];

            let sessionsScheduled = 0;
            const shuffledRooms = [...rooms].sort(() => Math.random() - 0.5);

            let scheduled = false;

            for (let i = 0; i < shuffledRooms.length; i++) {
                for (let j = 0; j < shuffledRooms.length; j++) {
                    if (i === j) continue;

                    const room1 = shuffledRooms[i];
                    const room2 = shuffledRooms[j];

                    const slot1 = findAvailableBlock({
                        room: room1,
                        day: day1,
                        requiredSlots,
                        existingSchedules,
                        scheduleSoFar: generated,
                    });

                    const slot2 = findAvailableBlock({
                        room: room2,
                        day: day2,
                        requiredSlots,
                        existingSchedules,
                        scheduleSoFar: generated,
                    });

                    if (
                        slot1 &&
                        slot2 &&
                        slot1.startTime === slot2.startTime &&
                        slot1.endTime === slot2.endTime
                    ) {
                        generated.push(
                            {
                                courseId: course._id,
                                courseName: course.courseName,
                                room: room1,
                                day: day1,
                                startTime: slot1.startTime,
                                endTime: slot1.endTime,
                                academicYear: set.academicYear,
                                semester: set.semester,
                                department: set.department,
                                areaOfStudy: set.areaOfStudy,
                                yearLevel: set.yearLevel,
                                setName: set.setName,
                            },
                            {
                                courseId: course._id,
                                courseName: course.courseName,
                                room: room2,
                                day: day2,
                                startTime: slot2.startTime,
                                endTime: slot2.endTime,
                                academicYear: set.academicYear,
                                semester: set.semester,
                                department: set.department,
                                areaOfStudy: set.areaOfStudy,
                                yearLevel: set.yearLevel,
                                setName: set.setName,
                            }
                        );

                        sessionsScheduled += 2;
                        scheduled = true;
                        break;
                    }
                }
                if (scheduled) break;
            }

            if (sessionsScheduled < sessionsNeeded) {
                return res.status(409).json({
                    message: `Could not fully schedule ${course.courseName} using ${day1} & ${day2}.`,
                });
            }
        }

        return res.status(200).json({ generatedSchedule: generated });
    } catch (error) {
        console.error("Auto-schedule error:", error.message);
        console.error(error.stack);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


// To save to DB:
// await Schedule.insertMany(generated);
// return res.status(201).json({ message: "Schedule successfully saved.", generatedSchedule: generated });