import axios from "axios";

const API_URL = "http://localhost:5000/api/schedules";

export const fetchSchedules = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createSchedule = async (scheduleData) => {
    const formattedSchedule = {
        ...scheduleData,
        startTime: Number(scheduleData.startTime) || 0,
        endTime: Number(scheduleData.endTime) || 0,
    };

    const response = await axios.post(API_URL, formattedSchedule, {
        headers: { "Content-Type": "application/json" },
    });

    return response.data;
};

export const updateSchedule = async (id, scheduleData) => {
    const response = await axios.put(`${API_URL}/${id}`, scheduleData);
    return response.data;
};

export const deleteSchedule = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
