import { useState, useEffect } from 'react';
import axios from 'axios';

const AutoScheduler = () => {
	const [setInfo, setSetInfo] = useState({
		setName: '', // ⬅️ added
		department: '',
		areaOfStudy: '',
		yearLevel: '',
		academicYear: '',
		semester: '',
	});
	const [courses, setCourses] = useState([]);
	const [rooms, setRooms] = useState([]);
	const [generatedSchedule, setGeneratedSchedule] = useState([]);

	useEffect(() => {
		fetchRooms();
	}, []);

	const fetchRooms = async () => {
		const res = await axios.get('http://localhost:5000/api/rooms');
		setRooms(res.data);
	};

	useEffect(() => {
		const fetchCourses = async () => {
			if (
				!setInfo.yearLevel ||
				!setInfo.department ||
				!setInfo.areaOfStudy ||
				!setInfo.semester
			)
				return;

			try {
				const res = await axios.get(
					`http://localhost:5000/api/courses/filter?yearLevel=${setInfo.yearLevel}&areaOfStudy=${setInfo.areaOfStudy}&department=${setInfo.department}&semester=${setInfo.semester}`
				);

				console.log(res.data);

				const enhanced = res.data.courses.map((c) => ({
					...c,
					sessionsPerWeek: 4,
					hoursPerDay: 1.5,
				}));

				setCourses(enhanced);
			} catch (err) {
				console.error('Failed to fetch filtered courses:', err);
				setCourses([]);
			}
		};

		fetchCourses();
	}, [
		setInfo.areaOfStudy,
		setInfo.department,
		setInfo.semester,
		setInfo.yearLevel,
	]);

	const handleChange = (e) => {
		setSetInfo({ ...setInfo, [e.target.name]: e.target.value });
	};

	const handleGenerate = async () => {
		try {
			const payload = {
				set: setInfo,
				courses: courses.map(
					({ _id, courseName, sessionsPerWeek, hoursPerDay }) => ({
						_id,
						courseName,
						sessionsPerWeek,
						hoursPerDay,
					})
				),
				rooms: rooms.map((r) => r.name),
			};

			const res = await axios.post(
				'http://localhost:5000/api/auto-schedule',
				payload
			);
			setGeneratedSchedule(res.data.generatedSchedule);
		} catch (err) {
			console.error('Scheduling error', err);
			alert('Failed to generate schedule');
		}
	};

	return (
		<div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
			<h1 className="text-lg font-bold mb-2">Auto Schedule Generator</h1>

			<input
				name="setName"
				placeholder="Set Name (e.g., Set A)"
				className="w-full mb-2 border p-2"
				maxLength={1}
				onChange={handleChange}
			/>

			<label className="flex w-full flex-col gap-1">
				<h1 className="text-sm font-medium">Department</h1>
				<select
					name="department"
					onChange={handleChange}
					value={setInfo.department}
					className="block w-full cursor-pointer rounded-md border border-slate-200 px-3 py-2 shadow-2xs"
					required>
					<option value="" disabled>
						Department
					</option>
					<option value="Computer Science Department">
						Computer Science Department
					</option>
					<option value="Business Education Department">
						Business Education Department
					</option>
					<option value="Hospitality Management Department">
						Hospitality Management Department
					</option>
					<option value="Teacher Education Department">
						Teacher Education Department
					</option>
				</select>
			</label>

			<label className="flex w-full flex-col gap-1">
				<h1 className="text-sm font-medium">Area Of Study</h1>

				<select
					name="areaOfStudy"
					value={setInfo.areaOfStudy}
					onChange={handleChange}
					className="block w-full cursor-pointer rounded-md border border-slate-200 px-3 py-2 shadow-2xs disabled:bg-zinc-200"
					required>
					<option value="" disabled>
						Select Course
					</option>
					<option value="BSBA HRM">BSBA HRM</option>
					<option value="BSBA FM">BSBA FM</option>
					<option value="BSA">BSA</option>
					<option value="BSCS">BSCS</option>
					<option value="BSED MATH & FIL">BSED MATH & FIL</option>
					<option value="BSED SOCSTUD">BSED SOCSTUD</option>
					<option value="BEED">BEED</option>
					<option value="CPE">CPE</option>
					<option value="BSHM">BSHM</option>
				</select>
			</label>

			<label className="flex w-full flex-col gap-1">
				<h1 className="text-sm font-medium">Year Level</h1>
				<select
					name="yearLevel"
					value={setInfo.yearLevel}
					onChange={handleChange}
					className="block w-full cursor-pointer rounded-md border border-slate-200 px-3 py-2 shadow-2xs disabled:bg-zinc-200"
					required>
					<option value="" disabled>
						Select Year Level
					</option>
					<option value="1">1st Year</option>
					<option value="2">2nd Year</option>
					<option value="3">3rd Year</option>
					<option value="4">4th Year</option>
				</select>
			</label>

			<label className="flex w-full flex-col gap-1">
				<h1 className="text-sm font-medium">Semester</h1>
				{/* Course Dropdown */}
				<select
					name="semester"
					onChange={handleChange}
					value={setInfo.semester}
					className="block w-full cursor-pointer rounded-md border border-slate-200 px-3 py-2 shadow-2xs disabled:bg-zinc-200"
					required>
					<option value="" disabled>
						Select Semester
					</option>
					<option value="1st Semester">1st Semester</option>
					<option value="2nd Semester">2nd Semester</option>
					<option value="Summer">Summer</option>
					<option value="Januarian">Januarian</option>
					<option value="Octoberian">Octoberian</option>
				</select>
			</label>

			<input
				name="academicYear"
				placeholder="Academic Year (e.g. 2025-2026)"
				className="w-full mb-4 border p-2"
				onChange={handleChange}
			/>

			{courses.map((course, idx) => (
				<div key={course._id} className="border p-2 mb-2 rounded">
					<div className="font-semibold">{course.courseName}</div>

					<label className="block text-sm mt-1">
						Sessions/Week:
						<input
							type="number"
							min="1"
							max="6"
							step="1"
							className="border ml-2 p-1 w-20"
							value={course.sessionsPerWeek}
							onChange={(e) => {
								const updated = [...courses];
								updated[idx].sessionsPerWeek = parseInt(e.target.value);
								setCourses(updated);
							}}
						/>
					</label>

					<label className="block text-sm mt-1">
						Hours/Day:
						<input
							type="number"
							min="0.5"
							max="4"
							step="0.5"
							className="border ml-2 p-1 w-20"
							value={course.hoursPerDay}
							onChange={(e) => {
								const updated = [...courses];
								updated[idx].hoursPerDay = parseFloat(e.target.value);
								setCourses(updated);
							}}
						/>
					</label>
				</div>
			))}

			<button
				onClick={handleGenerate}
				className="w-full bg-black text-white py-2 rounded mb-4">
				Generate Schedule
			</button>

			{generatedSchedule.length > 0 && (
				<div>
					<h2 className="text-md font-semibold mb-2">Generated Schedule</h2>
					<ul className="text-sm">
						{generatedSchedule.map((item, i) => (
							<li key={i}>
								{item.courseName} | {item.room} | {item.day} | {item.startTime}–
								{item.endTime}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default AutoScheduler;
