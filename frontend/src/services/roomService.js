import axios from 'axios';

const API = 'http://localhost:5000/api/rooms';

export const fetchRooms = async () => {
    return axios.get(API);
};

export const addRoom = async (roomName) => {
    return axios.post(API, { name: roomName });
};
