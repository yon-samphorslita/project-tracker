/**
 * Convert a Date object to "YYYY-MM-DDTHH:mm" string for <input type="datetime-local">
 * @param {Date} date
 * @returns {string}
 */
export function formatLocalDatetime(date) {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Convert ISO string to local Date object
 * Handles UTC / timezone offset automatically
 * @param {string} dateStr
 * @returns {Date|null}
 */
export function toLocal(dateStr) {
  return dateStr ? new Date(dateStr) : null
}

/**
 * Get today's date in "YYYY-MM-DDTHH:mm" for min attributes
 * @returns {string}
 */
export function getTodayMin() {
  return formatLocalDatetime(new Date())
}

/**
 * Get min date for end/due inputs based on start date
 * @param {string} startDate
 * @returns {string|undefined}
 */
export function getMinDate(startDate) {
  return startDate || undefined
}

/**
 * Convert a Date object to HH:mm string for display
 * @param {Date} date
 */
export function formatTime(date) {
  if (!date) return ''
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Format start & end for time range
 * @param {object} item with start & end as Date objects
 */
export function formatTimeRange(item) {
  if (!item.start || !item.end) return ''
  return `${formatTime(item.start)} - ${formatTime(item.end)}`
}
