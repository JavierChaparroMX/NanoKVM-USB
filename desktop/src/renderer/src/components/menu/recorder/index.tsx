import { useEffect, useRef, useState } from 'react'
import { Circle } from 'lucide-react'
import clsx from 'clsx'

import { startRecording, stopRecording, getRecordingDuration } from '@renderer/libs/recorder'

export const Recorder = () => {
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!recording) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = window.setInterval(() => {
      setDuration(getRecordingDuration())
    }, 100)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [recording])

  const handleToggleRecord = () => {
    try {
      if (recording) {
        // Stop recording
        const success = stopRecording()
        if (success) {
          setRecording(false)
          setDuration(0)
        }
      } else {
        // Start recording
        const success = startRecording('video')
        if (success) {
          setRecording(true)
          setDuration(0)
        }
      }
    } catch (error) {
      console.error('Recording error:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  if (recording) {
    return (
      <div
        className={clsx(
          'flex h-[28px] min-w-[28px] cursor-pointer items-center justify-center space-x-1 rounded px-1 text-white hover:bg-neutral-700/70'
        )}
        onClick={handleToggleRecord}
      >
        <Circle className="animate-pulse fill-red-400 text-red-400" size={18} />
        <span className="text-xs text-red-300">{formatDuration(duration)}</span>
      </div>
    )
  }

  return (
    <div
      className="flex h-[28px] cursor-pointer items-center justify-center rounded px-2 text-white hover:bg-neutral-700/70"
      onClick={handleToggleRecord}
    >
      <Circle size={18} />
    </div>
  )
}
