/**
 * Generate a sine wave with specified parameters
 * @param {number} amplitude - Wave amplitude
 * @param {number} frequency - Wave frequency in Hz
 * @param {number} phase - Phase offset in radians
 * @param {number} sampleRate - Number of data points per second
 * @param {number} duration - Length of wave in seconds
 * @returns {Array<{time: number, value: number}>} Array of time-value pairs
 */
export function generateSineWave(amplitude, frequency, phase, sampleRate, duration) {
  const totalPoints = Math.floor(sampleRate * duration)
  const data = []

  for (let i = 0; i < totalPoints; i++) {
    const time = i / sampleRate
    const value = amplitude * Math.sin(2 * Math.PI * frequency * time + phase)
    data.push({ time, value })
  }

  return data
}

/**
 * Export wave data as CSV
 * @param {Array<{time: number, value: number}>} data - Wave data
 * @param {boolean} includeTime - Whether to include time column (default: true)
 * @returns {string} CSV formatted string
 */
export function exportToCSV(data, includeTime = true) {
  if (includeTime) {
    const header = 'timestamp,a1,a2,a3,a4\n'
    const rows = data.map(point => `${point.time.toFixed(2)},${point.value.toFixed(4)},0.0000,0.0000,0.0000`).join('\n')
    return header + rows
  } else {
    const header = 'a1,a2,a3,a4\n'
    const rows = data.map(point => `${point.value.toFixed(4)},0.0000,0.0000,0.0000`).join('\n')
    return header + rows
  }
}

/**
 * Download data as CSV file
 * @param {string} csvData - CSV formatted string
 * @param {string} filename - Name of the file to download
 */
export function downloadCSV(csvData, filename = 'sine_wave.csv') {
  const blob = new Blob([csvData], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
