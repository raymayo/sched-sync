const useFormatTime = () => {
    const formatTime = (time) => {
        let hour, minute;

        if (typeof time === 'number') {
            hour = Math.floor(time / 100);
            minute = time % 100;
        } else if (typeof time === 'string') {
            const [h, m] = time.split(':');
            hour = parseInt(h, 10);
            minute = parseInt(m, 10);
        } else {
            return time;
        }

        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 === 0 ? 12 : hour % 12;
        const minuteStr = minute.toString().padStart(2, '0');

        return `${hour12}:${minuteStr} ${period}`;
    };

    return { formatTime };
};

export default useFormatTime;
