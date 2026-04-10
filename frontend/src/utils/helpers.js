export const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        const weekday = weekdays[date.getDay()];
        
        dates.push({
            value: formattedDate,
            label: `${formattedDate} (${weekday})`,
            date: date
        });
    }
    return dates;
};

export const generateTimeOptions = (type = 'start') => {
    const times = [];
    
    if (type === 'start') {
        times.push({ value: 'Выходной', label: 'Выходной' });
        
        for (let hour = 6; hour < 24; hour++) {
            for (let minute of [0, 15, 30, 45]) {
                if (hour === 6 && minute < 30) continue;
                const timeValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                times.push({ value: timeValue, label: timeValue });
            }
        }
    }
    
    return times;
};

export const generateEndTimeOptions = (startTime) => {
    if (!startTime || startTime === 'Выходной') return [];
    
    const times = [{ value: '', label: '-- Выберите время --', disabled: true }];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    
    for (let hour = 0; hour < 25; hour++) {
        for (let minute of [0, 15, 30, 45]) {
            if (hour === 24 && minute > 0) continue;
            
            let endHour = hour;
            let displayHour = hour;
            let nextDay = false;
            
            if (hour === 24) {
                displayHour = 0;
                nextDay = true;
            }
            
            const endTotalMinutes = (hour === 24 ? 24 * 60 : hour * 60 + minute);
            let adjustedEndTotalMinutes = endTotalMinutes;
            
            if (hour < 6 && hour !== 24) {
                adjustedEndTotalMinutes += 24 * 60;
            }
            
            if (adjustedEndTotalMinutes <= startTotalMinutes) continue;
            
            const shiftDuration = adjustedEndTotalMinutes - startTotalMinutes;
            if (shiftDuration > 720) continue;
            
            if (hour > 2 && hour < 6 && hour !== 24) continue;
            if (hour === 2 && minute > 0) continue;
            
            const timeValue = `${String(endHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            const timeLabel = nextDay ? `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} (след. день)` : `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            
            times.push({ value: timeValue, label: timeLabel });
        }
    }
    
    return times;
};

export const checkConsecutiveShifts = (employee, newDate) => {
    if (!employee || !employee.shifts || employee.shifts.length === 0) {
        return { canAdd: true, count: 1, dates: [newDate] };
    }
    
    const sortedShifts = [...employee.shifts].sort((a, b) => new Date(a.date) - new Date(b.date));
    const allDates = [...sortedShifts.map(s => s.date), newDate].sort();
    
    let maxConsecutive = 0;
    let currentConsecutive = 0;
    let lastDate = null;
    let consecutiveDates = [];
    
    for (let i = 0; i < allDates.length; i++) {
        const currentDate = new Date(allDates[i]);
        
        if (lastDate) {
            const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                currentConsecutive++;
                consecutiveDates.push(allDates[i]);
            } else {
                currentConsecutive = 1;
                consecutiveDates = [allDates[i]];
            }
        } else {
            currentConsecutive = 1;
            consecutiveDates = [allDates[i]];
        }
        
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        lastDate = currentDate;
    }
    
    return {
        canAdd: maxConsecutive <= 6,
        count: maxConsecutive,
        dates: consecutiveDates
    };
};

export const calculateEmployeeMetrics = (employee) => {
    let weekdayShifts = 0;
    let weekendShifts = 0;
    const totalShifts = employee.shifts.length;
    
    employee.shifts.forEach(shift => {
        const date = new Date(shift.date);
        const day = date.getDay();
        if (day >= 1 && day <= 5) weekdayShifts++;
        else weekendShifts++;
    });
    
    return {
        weekdayPercentage: totalShifts > 0 ? ((weekdayShifts / totalShifts) * 100).toFixed(2) : '0.00',
        weekendPercentage: totalShifts > 0 ? ((weekendShifts / totalShifts) * 100).toFixed(2) : '0.00'
    };
};

export const calculateMaxConsecutiveShifts = (employee) => {
    if (!employee || employee.shifts.length === 0) return 0;
    
    const sortedShifts = [...employee.shifts].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    let lastDate = new Date(sortedShifts[0].date);
    
    for (let i = 1; i < sortedShifts.length; i++) {
        const currentDate = new Date(sortedShifts[i].date);
        const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            currentConsecutive++;
            maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        } else {
            currentConsecutive = 1;
        }
        
        lastDate = currentDate;
    }
    
    return maxConsecutive;
};