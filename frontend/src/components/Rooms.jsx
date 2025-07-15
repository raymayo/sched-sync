import React, { useState, useEffect, useRef } from 'react';
import { fetchRooms, addRoom } from '../services/roomService.js';

const Rooms = () => {
	const [rooms, setRooms] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [roomName, setRoomName] = useState('');
	const inputRef = useRef(null);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleAddRoom = async () => {
		if (!roomName.trim()) return;

		try {
			await addRoom(roomName.toUpperCase());
			setRoomName('');
			setShowModal(false);
			loadRooms();
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		loadRooms();
		if (showModal && inputRef.current) {
			inputRef.current.focus();
		}

		const handleKeyDown = (e) => {
			if (e.key === 'Escape') {
				setShowModal(false);
			}
			if (e.key === 'Enter') {
				// Optional: prevent default if inside a form
				e.preventDefault();
				handleAddRoom();
			}
		};

		if (showModal) {
			window.addEventListener('keydown', handleKeyDown);
		}

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [showModal, handleAddRoom]);

	const loadRooms = async () => {
		try {
			const res = await fetchRooms();
			setRooms(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="p-6 max-w-2xl mx-auto border border-indigo-200 shadow-lg rounded-xl">
			<h2 className="text-2xl text-indigo-900 font-semibold mb-4">Rooms</h2>

			<button
				onClick={() => setShowModal(true)}
				className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
				Add Room
			</button>

			<table className="w-full ">
				<thead>
					<tr className="">
						<th className="p-2 text-left font-medium border-b border-indigo-200">
							#
						</th>
						<th className="p-2 text-left font-medium border-b border-indigo-200">
							Room Name
						</th>
						<th className="p-2 text-left font-medium border-b border-indigo-200">
							Action
						</th>
					</tr>
				</thead>
				<tbody>
					{rooms.length === 0 ? (
						<tr>
							<td
								colSpan="2"
								className="border-b p-2 text-center border-indigo-200 text-indigo-950">
								No rooms added yet.
							</td>
						</tr>
					) : (
						rooms.map((room, index) => (
							<tr key={room.id}>
								<td className="border-b border-indigo-200 p-2">{index + 1}</td>
								<td className="border-b border-indigo-200 p-2">{room.name}</td>
								<td className="border-b border-indigo-200 p-2">delete edit</td>
							</tr>
						))
					)}
				</tbody>
			</table>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 flex items-center justify-center bg-black/60 bg-opacity-50">
					<div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg border-indigo-200 border">
						<h3 className="text-xl font-medium mb-4 text-indigo-900 ">
							Add New Room
							<p className="text-sm text-zinc-500 font-normal">
								Input room here to be added to the available rooms.
							</p>
						</h3>
						<input
							type="text"
							ref={inputRef}
							value={roomName}
							onChange={(e) => setRoomName(e.target.value.toUpperCase())}
							className="w-full border border-indigo-200 shadow-2xs text-indigo-950 font-medium p-2 mb-4 rounded focus:outline-0"
							placeholder="Enter room name"
						/>
						<div className="flex justify-end gap-2">
							<button
								onClick={() => setShowModal(false)}
								className="px-4 py-2 border rounded border-indigo-200 shadow-2xs text-indigo-950 hover:bg-zinc-200 cursor-pointer">
								Cancel
							</button>
							<button
								onClick={handleAddRoom}
								className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer">
								Add
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Rooms;
