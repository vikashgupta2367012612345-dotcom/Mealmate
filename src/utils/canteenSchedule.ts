/**
 * DGU Central Canteen Real-Time Operating Schedule Engine
 * Operating hours: 10:00 AM to 11:00 PM (10:00 to 23:00) Everyday
 */

export type ScheduleMode = 'realtime' | 'simulate_open' | 'simulate_closed';

export interface CanteenScheduleInfo {
  isOpen: boolean;
  statusBadge: 'open' | 'closed';
  statusText: string;
  subText: string;
  timeRemainingText: string;
  currentTimeFormatted: string;
  openingHoursDisplay: string;
  mode: ScheduleMode;
}

export const CANTEEN_OPEN_HOUR = 10; // 10:00 AM
export const CANTEEN_CLOSE_HOUR = 23; // 11:00 PM (23:00)

export function calculateCanteenSchedule(
  now: Date = new Date(),
  mode: ScheduleMode = 'realtime'
): CanteenScheduleInfo {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Format current 12-hour time
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const currentTimeFormatted = `${displayHours}:${displayMinutes} ${ampm}`;

  // Default real-time determination: 10:00 AM to 11:00 PM
  const isRealTimeOpen = hours >= CANTEEN_OPEN_HOUR && hours < CANTEEN_CLOSE_HOUR;

  let isOpen = isRealTimeOpen;
  if (mode === 'simulate_open') {
    isOpen = true;
  } else if (mode === 'simulate_closed') {
    isOpen = false;
  }

  let timeRemainingText = '';
  let subText = '';

  if (isOpen) {
    // Calculate time until 11:00 PM
    let remainingMinutes: number;
    if (mode === 'simulate_open' && !isRealTimeOpen) {
      remainingMinutes = 4 * 60 + 20; // 4h 20m simulated
    } else {
      const closeMinutes = CANTEEN_CLOSE_HOUR * 60;
      const currentMinutes = hours * 60 + minutes;
      remainingMinutes = Math.max(0, closeMinutes - currentMinutes);
    }

    const remHours = Math.floor(remainingMinutes / 60);
    const remMins = remainingMinutes % 60;
    
    if (remHours > 0) {
      timeRemainingText = `Closes in ${remHours}h ${remMins}m (at 11:00 PM)`;
    } else {
      timeRemainingText = `Closes in ${remMins}m (at 11:00 PM)`;
    }
    subText = 'Kitchen counter actively taking live meal orders';
  } else {
    // Calculate time until next 10:00 AM
    let minutesUntilOpen: number;
    if (mode === 'simulate_closed' && isRealTimeOpen) {
      minutesUntilOpen = 7 * 60 + 15; // 7h 15m simulated
    } else if (hours < CANTEEN_OPEN_HOUR) {
      // Opening today at 10:00 AM
      const currentMinutes = hours * 60 + minutes;
      minutesUntilOpen = CANTEEN_OPEN_HOUR * 60 - currentMinutes;
    } else {
      // Opening tomorrow at 10:00 AM
      const minutesLeftToday = 24 * 60 - (hours * 60 + minutes);
      minutesUntilOpen = minutesLeftToday + CANTEEN_OPEN_HOUR * 60;
    }

    const waitHours = Math.floor(minutesUntilOpen / 60);
    const waitMins = minutesUntilOpen % 60;

    if (waitHours > 0) {
      timeRemainingText = `Opens in ${waitHours}h ${waitMins}m (at 10:00 AM)`;
    } else {
      timeRemainingText = `Opens in ${waitMins}m (at 10:00 AM)`;
    }
    subText = 'Pre-orders accepted for next 10:00 AM morning batch';
  }

  return {
    isOpen,
    statusBadge: isOpen ? 'open' : 'closed',
    statusText: isOpen ? 'Open Now' : 'Closed Now',
    subText,
    timeRemainingText,
    currentTimeFormatted,
    openingHoursDisplay: '10:00 AM – 11:00 PM everyday',
    mode
  };
}

export function formatSlotLabel(
  startDate: Date,
  durationMinutes: number = 15,
  isTomorrow: boolean = false
): string {
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const startH = startDate.getHours();
  const startM = startDate.getMinutes();
  const startAmpm = startH >= 12 ? 'PM' : 'AM';
  const startH12 = startH % 12 === 0 ? 12 : startH % 12;
  const startDisp = `${startH12}:${startM < 10 ? '0' : ''}${startM}`;

  const endH = endDate.getHours();
  const endM = endDate.getMinutes();
  const endAmpm = endH >= 12 ? 'PM' : 'AM';
  const endH12 = endH % 12 === 0 ? 12 : endH % 12;
  const endDisp = `${endH12}:${endM < 10 ? '0' : ''}${endM}`;

  const prefix = isTomorrow ? 'Tomorrow ' : '';
  if (startAmpm === endAmpm) {
    return `${prefix}${startDisp} – ${endDisp} ${endAmpm}`;
  }
  return `${prefix}${startDisp} ${startAmpm} – ${endDisp} ${endAmpm}`;
}

export interface DynamicSlotInfo {
  id: string;
  label: string;
  capacity: number;
  reserved: number;
  isPeak?: boolean;
}

export function generateUpcomingSlots(
  now: Date = new Date(),
  mode: ScheduleMode = 'realtime'
): DynamicSlotInfo[] {
  const hours = now.getHours();

  const isRealTimeOpen = hours >= CANTEEN_OPEN_HOUR && hours < CANTEEN_CLOSE_HOUR;
  const isOpen = mode === 'simulate_open' ? true : mode === 'simulate_closed' ? false : isRealTimeOpen;

  const slots: DynamicSlotInfo[] = [];

  if (!isOpen) {
    // Canteen is closed: next batches open at 10:00 AM (either later today or tomorrow)
    const isTomorrow = mode === 'simulate_closed' || hours >= CANTEEN_CLOSE_HOUR;
    const baseDate = new Date(now);
    if (isTomorrow) {
      baseDate.setDate(baseDate.getDate() + 1);
    }
    baseDate.setHours(CANTEEN_OPEN_HOUR, 15, 0, 0);

    for (let i = 0; i < 7; i++) {
      const slotStart = new Date(baseDate.getTime() + i * 15 * 60 * 1000);
      const slotH = slotStart.getHours();
      const slotM = slotStart.getMinutes();
      const id = `slot-${isTomorrow ? 'tmr-' : ''}${slotH}-${slotM < 10 ? '0' : ''}${slotM}`;
      const label = formatSlotLabel(slotStart, 15, isTomorrow);
      const reserved = i === 0 ? 5 : i === 1 ? 3 : i === 2 ? 4 : 2;
      slots.push({
        id,
        label,
        capacity: 8,
        reserved,
        isPeak: i === 0 || i === 2
      });
    }
    return slots;
  }

  // Canteen is OPEN:
  // Calculate earliest ready pickup window with at least 10 minutes prep time buffer
  const bufferMs = 10 * 60 * 1000;
  const earliestTime = new Date(now.getTime() + bufferMs);

  // Round up to nearest 15-minute slot boundary (:00, :15, :30, :45)
  const remainder = earliestTime.getMinutes() % 15;
  const minutesToAdd = remainder === 0 ? 0 : 15 - remainder;
  const firstSlotStart = new Date(earliestTime.getTime() + minutesToAdd * 60 * 1000);
  firstSlotStart.setSeconds(0, 0);
  firstSlotStart.setMilliseconds(0);

  // If earlier than opening time (10:15 AM)
  if (firstSlotStart.getHours() < CANTEEN_OPEN_HOUR) {
    firstSlotStart.setHours(CANTEEN_OPEN_HOUR, 15, 0, 0);
  }

  // Generate 7 upcoming consecutive slots
  for (let i = 0; i < 7; i++) {
    const slotStart = new Date(firstSlotStart.getTime() + i * 15 * 60 * 1000);
    // Don't generate slots past closing time (23:00 / 11:00 PM)
    if (slotStart.getHours() >= CANTEEN_CLOSE_HOUR) {
      break;
    }

    const slotH = slotStart.getHours();
    const slotM = slotStart.getMinutes();
    const id = `slot-${slotH}-${slotM < 10 ? '0' : ''}${slotM}`;
    const label = formatSlotLabel(slotStart, 15, false);

    // Realistic live occupancy: immediate next window is in high demand with spots taken
    const reserved = i === 0 ? 6 : i === 1 ? 4 : i === 2 ? 3 : (i % 2 === 0 ? 2 : 1);
    const isPeak = i === 0 || reserved >= 5;

    slots.push({
      id,
      label,
      capacity: 8,
      reserved,
      isPeak
    });
  }

  // If very late at night and no slots left today, provide tomorrow morning batch
  if (slots.length === 0) {
    const tomorrowBase = new Date(now);
    tomorrowBase.setDate(tomorrowBase.getDate() + 1);
    tomorrowBase.setHours(CANTEEN_OPEN_HOUR, 15, 0, 0);
    for (let i = 0; i < 6; i++) {
      const slotStart = new Date(tomorrowBase.getTime() + i * 15 * 60 * 1000);
      const slotH = slotStart.getHours();
      const slotM = slotStart.getMinutes();
      const id = `slot-tmr-${slotH}-${slotM < 10 ? '0' : ''}${slotM}`;
      const label = formatSlotLabel(slotStart, 15, true);
      slots.push({
        id,
        label,
        capacity: 8,
        reserved: i === 0 ? 3 : 1,
        isPeak: i === 0
      });
    }
  }

  return slots;
}
