import Schedule from "../models/Schedule.js";

// --- Slot generator: 7:00–21:00 in 30′ steps ---
const getAllTimeSlots = () => {
    const slots = [];
    for (let h = 7; h < 21; h++) {
        for (let m = 0; m < 60; m += 30) {
            const start = h * 100 + m;
            let eh = h, em = m + 30;
            if (em >= 60) { eh++; em = 0; }
            slots.push({ startTime: start, endTime: eh * 100 + em });
        }
    }
    return slots;
};

const isOverlapping = (aS, aE, bS, bE) => aS < bE && aE > bS;

const timeBoundaries = {
    morning: { softLimit: 1400 },
    afternoon: { softLimit: 1900 },
    evening: { softLimit: 2100 },
};

const blockedDays = new Set(["Sun"]);
const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const altPairs2 = [["Mon", "Thu"], ["Tue", "Fri"], ["Wed", "Sat"]];

const isRestDay = (day, loadMap) => {
    const idx = orderedDays.indexOf(day);
    if (idx < 2) return false;
    const p1 = orderedDays[idx - 1], p2 = orderedDays[idx - 2];
    return loadMap[p1] > 0 && loadMap[p2] > 0;
};

const slotIsFree = (day, start, end, room, existing, generated, set) =>
    ![...existing, ...generated].some(s =>
        s.day === day &&
        isOverlapping(start, end, s.startTime, s.endTime) &&
        (s.room === room ||
            (s.setName === set.setName &&
                s.yearLevel === set.yearLevel &&
                s.areaOfStudy === set.areaOfStudy &&
                s.department === set.department))
    );

// try to batch-allocate one course under given flex mode, with alt-day support
function tryBatch({
    sessionCount, slotsNeeded,
    set, rooms, existing, generated, loadMap,
    pref, sameRoom, sameTime
}) {
    const lim = timeBoundaries[set.timePreference];
    const allSlots = getAllTimeSlots().filter(s => s.endTime <= lim.softLimit);

    // candidate days (respect rest and daily cap)
    const days = orderedDays
        .filter(d => !blockedDays.has(d))
        .filter(d => !isRestDay(d, loadMap))
        .filter(d => loadMap[d] < 360);

    // determine room list for this phase
    const roomList = sameRoom && pref.room
        ? [pref.room]
        : rooms;

    for (const room of roomList) {
        for (let i = 0; i <= allSlots.length - slotsNeeded; i++) {
            const block = allSlots.slice(i, i + slotsNeeded);
            const start = block[0].startTime;
            const end = block[block.length - 1].endTime;

            // enforce sameTime if required
            if (sameTime && pref.start != null) {
                if (pref.start !== start || pref.end !== end) continue;
            }

            // **Alternate‐day pairing** for two sessions:
            if (sessionCount === 2) {
                for (const [d1, d2] of altPairs2) {
                    if (
                        days.includes(d1) &&
                        days.includes(d2) &&
                        slotIsFree(d1, start, end, room, existing, generated, set) &&
                        slotIsFree(d2, start, end, room, existing, generated, set)
                    ) {
                        return { room, startTime: start, endTime: end, days: [d1, d2] };
                    }
                }
            }

            // fallback: any free days
            const freeDays = days.filter(d =>
                slotIsFree(d, start, end, room, existing, generated, set)
            );
            if (freeDays.length >= sessionCount) {
                return {
                    room,
                    startTime: start,
                    endTime: end,
                    days: freeDays.slice(0, sessionCount)
                };
            }
        }
    }

    return null;
}

export const autoGenerateSchedule = async (req, res) => {
    const { set, courses, rooms } = req.body;
    if (
        !set ||
        !Array.isArray(courses) ||
        !Array.isArray(rooms) ||
        !["morning", "afternoon", "evening"].includes(set.timePreference)
    ) {
        return res.status(400).json({ message: "Missing or invalid fields." });
    }

    try {
        const existing = await Schedule.find({
            academicYear: set.academicYear,
            semester: set.semester,
        });

        const generated = [];
        const loadMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
        const coursePrefs = {};  // stores { room, start, end } after Phase 0

        for (const course of courses) {
            const count = course.sessionsPerWeek;
            if (count <= 0) continue;
            const slotsNeeded = Math.ceil((course.hoursPerDay * 60) / 30);

            let allocation = null;
            const modes = [
                { sameRoom: true, sameTime: true },
                { sameRoom: false, sameTime: true },
                { sameRoom: false, sameTime: false },
            ];

            for (let phase = 0; phase < modes.length; phase++) {
                allocation = tryBatch({
                    sessionCount: count,
                    slotsNeeded,
                    set, rooms,
                    existing, generated, loadMap,
                    pref: coursePrefs[course._id] || {},
                    sameRoom: modes[phase].sameRoom,
                    sameTime: modes[phase].sameTime
                });
                if (allocation) {
                    if (phase === 0) {
                        // record strict preference
                        coursePrefs[course._id] = {
                            room: allocation.room,
                            start: allocation.startTime,
                            end: allocation.endTime
                        };
                    }
                    break;
                }
            }

            if (!allocation) {
                return res
                    .status(409)
                    .json({ message: `Cannot schedule ${course.courseName}.` });
            }

            // Commit
            const { room, startTime, endTime, days } = allocation;
            for (const day of days) {
                generated.push({
                    course: course._id,
                    courseId: course.courseId,
                    courseName: course.courseName,
                    room, day,
                    startTime,
                    endTime,
                    academicYear: set.academicYear,
                    semester: set.semester,
                    department: set.department,
                    areaOfStudy: set.areaOfStudy,
                    yearLevel: set.yearLevel,
                    setName: set.setName,
                });
                const mins =
                    (Math.floor(endTime / 100) * 60 + endTime % 100) -
                    (Math.floor(startTime / 100) * 60 + startTime % 100);
                loadMap[day] += mins;
            }
        }

        return res.status(200).json({ generatedSchedule: generated });
    } catch (err) {
        console.error("Auto-schedule error:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};


export const getFullAvailability = async (req, res) => {
    const { academicYear, semester } = req.query;
    if (!academicYear || !semester) {
        return res.status(400).json({ message: "Missing academicYear or semester" });
    }

    try {
        // 1) load existing schedules
        const existing = await Schedule.find({ academicYear, semester });

        // 2) get your rooms list however you store it
        //    here I'm assuming you have a Room model
        const rooms = await import("../models/Room.js").then(m => m.default.find());

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const allSlots = getAllTimeSlots();

        // 3) build the grid
        const availability = rooms.map((room) => {
            const roomAvail = { room: room.name, days: {} };

            for (const day of days) {
                // for each slot, test free
                roomAvail.days[day] = allSlots
                    .filter(({ startTime, endTime }) =>
                        slotIsFree(day, startTime, endTime, room.name, existing, [], req.query.set || {})
                    )
                    .map(({ startTime, endTime }) => ({ startTime, endTime }));
            }

            return roomAvail;
        });

        return res.status(200).json({ availability });
    } catch (err) {
        console.error("Availability error:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const saveGeneratedSchedule = async (req, res) => {
    try {
        const { schedules } = req.body;

        console.log(req.body)

        if (!Array.isArray(schedules) || schedules.length === 0) {
            return res.status(400).json({ message: "No schedules provided." });
        }

        await Schedule.insertMany(schedules);
        return res.status(201).json({ message: "Schedules saved successfully." });
    } catch (error) {
        console.log('here:S', req.body)

        console.error("Save error:", error.message);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};