import express from 'express';
import { getRooms, createRoom } from '../controllers/roomController.js';

const router = express.Router();

router.get('/', getRooms);       // GET /api/rooms
router.post('/', createRoom);    // POST /api/rooms

export default router;
