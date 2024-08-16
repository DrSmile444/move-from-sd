/**
 * @param {Date} date
 * @returns {string}
 * */
export function getFullDate(date: Date | number): string {
  return new Date(date).toISOString().slice(0, 10);
}
