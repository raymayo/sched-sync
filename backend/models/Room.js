// models/Room.js
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        uppercase: true, // ensures all saved names are uppercase
        trim: true,
        unique: true,
    },
    // department: {
    //     type: String,
    //     required: true,
    //     trim: true,
    // },
    // capacity: {
    //     type: Number,
    //     required: true
    // },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
