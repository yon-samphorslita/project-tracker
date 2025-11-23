/**

* Get Random CSS colors from --random-color-1 to --random-color-10
* @returns {string[]} Array of color strings
  */
export function getRandomColors() {
  const styles = getComputedStyle(document.documentElement)
  const colors = []

  for (let i = 1; i <= 10; i++) {
    const value = styles.getPropertyValue(`--random-color-${i}`).trim()
    if (value) colors.push(value)
  }

  // Shuffle colors using Fisher–Yates
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[colors[i], colors[j]] = [colors[j], colors[i]]
  }

  return colors
}

/**
 * Get color based on priority
 * @param {object} item - Task or Event object
 * @returns {string} color hex
 */
export function getColor(item) {
  const priority = (item.type === 'event' ? item.project?.priority : item.t_priority)?.toUpperCase()
  if (priority === 'LOW') return '#C6E7FF'
  if (priority === 'MEDIUM') return '#FFD5DB'
  if (priority === 'HIGH') return '#FF8A5B'
  return '#D9D9D9'
}
