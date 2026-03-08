import { useState } from 'react'
import { Camera } from 'lucide-react'

import { captureScreenshot } from '@renderer/libs/screenshot'

export const Screenshot = () => {
  const [isCapturing, setIsCapturing] = useState(false)

  const handleScreenshot = () => {
    setIsCapturing(true)
    try {
      captureScreenshot('video', { timestamp: true })
    } catch (error) {
      console.error('Screenshot error:', error)
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <div
      className="flex h-[28px] cursor-pointer items-center justify-center rounded px-2 text-white hover:bg-neutral-700/70 disabled:opacity-50"
      onClick={handleScreenshot}
      style={{ pointerEvents: isCapturing ? 'none' : 'auto', opacity: isCapturing ? 0.5 : 1 }}
    >
      <Camera size={18} />
    </div>
  )
}
