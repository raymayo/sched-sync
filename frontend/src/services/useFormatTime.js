import { useCallback } from "react";

const useFormatTime = () => {
    const formatTime = useCallback((time) => {
        const hours = Math.floor(time / 100);
        const minutes = time % 100;
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes.toString().padStart(2, "0");
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    }, []);

    return { formatTime };
};

export default useFormatTime;
