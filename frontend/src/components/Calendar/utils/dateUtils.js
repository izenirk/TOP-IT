// Форматирование даты
export function formatDate(date, format = 'iso') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  switch (format) {
    case 'iso':
      return `${year}-${month}-${day}`
    case 'day':
      return `${day}.${month}`
    case 'short':
      return `${day}.${month}`
    case 'full':
      const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                     'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
      const weekdays = ['воскресенье', 'понедельник', 'вторник', 'среда', 
                       'четверг', 'пятница', 'суббота']
      return `${day} ${months[d.getMonth()]} ${year}, ${weekdays[d.getDay()]}`
    case 'monthYear':
      const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                         'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
      return `${monthNames[d.getMonth()]} ${year}`
    default:
      return `${year}-${month}-${day}`
  }
}

// Получение начала недели (понедельник)
export function getStartOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? 6 : day - 1)
  d.setDate(d.getDate() - diff)
  return d
}

// Получение смен за день
export function getDayShifts(shifts, dateStr) {
  return shifts.filter(shift => shift.date === dateStr)
}

// Получение дней недели
export function getWeekDays(currentDate, shifts, weekDayNames) {
  const startOfWeek = getStartOfWeek(currentDate)
  const days = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    const dateStr = formatDate(date, 'iso')
    
    days.push({
      date: dateStr,
      name: weekDayNames[i],
      isWeekend: i >= 5,
      shifts: shifts.filter(shift => shift.date === dateStr)
    })
  }
  
  return days
}

// Проверка наличия смены в указанное время
export function hasShiftAtTime(day, hour) {
  return day.shifts.some(shift => {
    if (shift.startTime === 'Выходной') return false
    const [startHour] = shift.startTime.split(':').map(Number)
    const [endHour] = shift.endTime.split(':').map(Number)
    let endHourAdjusted = endHour
    if (endHour < startHour) endHourAdjusted += 24
    return hour >= startHour && hour < endHourAdjusted
  })
}

// Получение смен в указанное время
export function getShiftsAtTime(day, hour) {
  return day.shifts.filter(shift => {
    if (shift.startTime === 'Выходной') return false
    const [startHour] = shift.startTime.split(':').map(Number)
    const [endHour] = shift.endTime.split(':').map(Number)
    let endHourAdjusted = endHour
    if (endHour < startHour) endHourAdjusted += 24
    return hour >= startHour && hour < endHourAdjusted
  })
}

// Проверка, сегодня ли дата
export function isToday(date) {
  const today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

// Получение недель месяца
export function getMonthWeeks(currentDate, shifts) {
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  let startDate = new Date(startOfMonth)
  const dayOfWeek = startDate.getDay()
  const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startDate.setDate(startDate.getDate() - startOffset)
  
  const weeks = []
  let weekNumber = 1
  
  while (startDate <= endOfMonth || weeks.length < 6) {
    const week = {
      weekNumber: weekNumber,
      days: []
    }
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dateStr = formatDate(date, 'iso')
      
      week.days.push({
        date: dateStr,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        isWeekend: i >= 5,
        isToday: isToday(date),
        shifts: shifts.filter(shift => shift.date === dateStr)
      })
    }
    
    weeks.push(week)
    startDate.setDate(startDate.getDate() + 7)
    weekNumber++
  }
  
  return weeks
}