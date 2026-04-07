export function parseTimeToMinutes(time: string) {
  const [clock, modifier] = time.split(' ');
  const [rawHour, rawMinute] = clock.split(':').map(Number);

  let hour = rawHour;

  if (modifier === 'PM' && hour !== 12) hour += 12;
  if (modifier === 'AM' && hour === 12) hour = 0;

  return hour * 60 + rawMinute;
}

export function minutesToTime(totalMinutes: number) {
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  const modifier = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${hour12}:${String(minute).padStart(2, '0')} ${modifier}`;
}

export function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
) {
  return startA < endB && endA > startB;
}