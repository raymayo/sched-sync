import { useState, useEffect } from 'react';

const days = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
];
const times = Array.from(
	{ length: 24 },
	(_, i) => `${String(i).padStart(2, '0')}:00`
);

const timeToIndex = (time) => {
	const [hour, minute] = time.split(':').map(Number);
	return hour * 2 + (minute >= 30 ? 1 : 0);
};

const WeekCalendar = ({ initialSchedules = [], onAddSchedule }) => {
	const [schedules, setSchedules] = useState([]);

	useEffect(() => {
		setSchedules(initialSchedules);
	}, [initialSchedules]);
	console.log(schedules);

	return (
		<div className="p-4">
			<div className="grid grid-cols-8 border text-xs">
				<div className="flex flex-col border-r">
					{times.map((t, idx) => (
						<div key={idx} className="h-12 border-t px-1">
							{t}
						</div>
					))}
				</div>

				{days.map((day) => (
					<div key={day} className="relative border-r">
						<div className="sticky top-0 bg-white text-center font-semibold border-b py-1">
							{day}
						</div>
						<div className="relative h-[1152px]">
							{schedules
								.filter((s) => s.day === day)
								.map((s, i) => {
									const top = timeToIndex(s.startTime) * 24;
									const height =
										(timeToIndex(s.endTime) - timeToIndex(s.startTime)) * 24;
									return (
										<div
											key={i}
											className="absolute left-1 right-1 bg-blue-400 text-white p-1 text-xs rounded shadow"
											style={{ top, height }}>
											{s.subject}
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
