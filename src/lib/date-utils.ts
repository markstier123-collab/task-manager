function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISODate(): string {
  return toISODate(new Date());
}

export function isToday(isoDate: string): boolean {
  return isoDate === todayISODate();
}

export function isThisWeek(isoDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = parseISODate(isoDate);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 6);
  return target >= today && target <= weekFromNow;
}

export function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_NAMES_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));

export function formatDateLabel(isoDate: string): string {
  const date = parseISODate(isoDate);
  return `${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Short form without year, e.g. "Aug 30" — used for group section headers. */
export function formatDateShort(isoDate: string): string {
  const date = parseISODate(isoDate);
  return `${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getDate()}`;
}

/** e.g. "Aug 29, 4:59 PM" — used for the "Created" meta chunk on a task card. */
export function formatDateTimeLabel(timestampMs: number): string {
  const date = new Date(timestampMs);
  const hours24 = date.getHours();
  const hours = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const meridiem = hours24 < 12 ? 'AM' : 'PM';
  return `${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getDate()}, ${hours}:${pad(date.getMinutes())} ${meridiem}`;
}

export const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function getMonthLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

/** Returns a grid of Date | null cells (weeks of 7) for the given month, padded to align on weekdays. */
export function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
