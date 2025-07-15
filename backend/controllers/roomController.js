import Room from '../models/Room.js';

// @desc    Get all rooms
export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 });
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch rooms' });
    }
};

// @desc    Create a new room
export const createRoom = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) return res.status(400).json({ message: 'Room name is required' });

        const existing = await Room.findOne({ name: name.toUpperCase() });
        if (existing) return res.status(409).json({ message: 'Room already exists' });

        const newRoom = await Room.create({ name });
        res.status(201).json(newRoom);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create room' });
    }
};
