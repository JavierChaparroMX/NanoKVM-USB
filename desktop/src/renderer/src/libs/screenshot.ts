/**
 * Screenshot utility for capturing the video stream
 */

interface ScreenshotOptions {
  timestamp?: boolean
  watermark?: string
}

/**
 * Capture the current video frame as an image
 */
export function captureScreenshot(
  videoElementId: string = 'video',
  options: ScreenshotOptions = { timestamp: true }
): boolean {
  try {
    const videoElement = document.getElementById(videoElementId) as HTMLVideoElement

    if (!videoElement) {
      console.error(`Video element with id "${videoElementId}" not found`)
      return false
    }

    // Create a canvas with the same dimensions as the video
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight

    // Draw the current video frame onto the canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Failed to get canvas context')
      return false
    }

    ctx.drawImage(videoElement, 0, 0)

    // Add timestamp if requested
    if (options.timestamp) {
      const date = new Date()
      const timeString = date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(timeString, 10, canvas.height - 8)
    }

    // Convert canvas to blob and trigger download
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob from canvas')
        return
      }

      downloadImage(blob)
    }, 'image/png')

    return true
  } catch (error) {
    console.error('Screenshot capture failed:', error)
    return false
  }
}

/**
 * Download the captured image
 */
function downloadImage(blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  // Generate filename with timestamp
  const date = new Date()
  const filename = `screenshot-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}-${String(date.getSeconds()).padStart(2, '0')}.png`

  link.href = url
  link.download = filename

  // Trigger download
  document.body.appendChild(link)
  link.click()

  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
