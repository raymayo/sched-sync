import { useState, useEffect } from 'react';
import useFormatTime from '../services/useFormatTime.js';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOT_HEIGHT = 48;

const generateTimeSlots = () => {
	const slots = [];
	for (let h = 7; h <= 21; h++) {
		slots.push(`${String(h).padStart(2, '0')}:00`);
		slots.push(`${String(h).padStart(2, '0')}:30`);
	}
	return slots;
};
const times = generateTimeSlots();

const timeToIndex = (num) => {
	const hour = Math.floor(num / 100);
	const min = num % 100;
	return (hour - 7) * 2 + (min >= 30 ? 1 : 0);
};

const colorPalette = [
	'bg-red-600/50',
	'bg-green-600/50',
	'bg-blue-600/50',
	'bg-yellow-600/50',
	'bg-purple-600/50',
	'bg-indigo-600/50',
	'bg-teal-600/50',
	'bg-orange-600/50',
];

const getColorClass = (item) => {
	if (!item?.course?.courseName) return 'bg-gray-200';

	let hash = 0;
	for (let i = 0; i < item.course.courseName.length; i++) {
		hash = item.course.courseName.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % colorPalette.length;
	return colorPalette[index];
};

const WeekCalendar = ({ initialSchedules = [], availableCourses = [] }) => {
	const { formatTime } = useFormatTime();
	const [schedules, setSchedules] = useState([]);
	const [courses, setCourses] = useState([]);

	useEffect(() => {
		setCourses(availableCourses);
		setSchedules(initialSchedules);
		// console.log('⏰ Loaded schedules:', initialSchedules);
		console.log('📚 Available courses:', availableCourses);
	}, [initialSchedules]);

	// const selectedCourse = courses.find((c) => c._id === schedule.course);

	return (
		<div className="p-4 overflow-auto">
			<div className="grid grid-cols-8 border text-xs min-w-[1000px]">
				{/* Time Column */}
				<div className="flex flex-col border-r bg-gray-50">
					<h1 className="p-1 text-center font-semibold">TIME</h1>
					{times.map((t, idx) => (
						<div key={idx} className="h-12 border-t px-1 box-border">
							{formatTime(t)}
						</div>
					))}
				</div>

				{/* Days Columns */}
				{days.map((day) => (
					<div key={day} className="relative border-r">
						<div className="sticky top-0 bg-white text-center font-semibold border-b py-1 z-10">
							{day}
						</div>
						<div
							className="relative"
							style={{ height: times.length * SLOT_HEIGHT }}>
							{schedules
								.filter((s) => s.day === day)
								.map((s, i) => {
									const top = timeToIndex(s.startTime) * SLOT_HEIGHT;
									const height =
										(timeToIndex(s.endTime) - timeToIndex(s.startTime)) *
										SLOT_HEIGHT;
									const color = getColorClass(s.courseName);
									const course = courses.find((c) => c._id === s.course);
									console.log('HAHA', course);
									console.log('HAHA', s.course);
									console.log('HAHA', courses);
									return (
										<div
											key={i}
											className={`absolute left-1 right-1 ${color} text-black p-1 border text-xs rounded shadow`}
											style={{ top, height }}>
											<div className="font-medium">{course.courseName}</div>
											<div>{s.room}</div>
											<div>
												{formatTime(s.startTime)} - {formatTime(s.endTime)}
											</div>
										</div>
									);
								})}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default WeekCalendar;
