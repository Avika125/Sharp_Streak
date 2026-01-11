export const getStartOfDay = (date: Date = new Date()): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

export const getEndOfDay = (date: Date = new Date()): Date => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};
