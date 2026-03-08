import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { Circle } from 'lucide-react';
import clsx from 'clsx';

import { startRecording, stopRecording, isRecording as getIsRecording, getRecordingDuration } from '@/libs/recorder';

export const ScreenRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!recording) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setDuration(getRecordingDuration());
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording]);

  const handleToggleRecord = () => {
    try {
      if (recording) {
        // Stop recording
        const success = stopRecording();
        if (success) {
          setRecording(false);
          setDuration(0);
          message.success('Recording saved!');
        } else {
          message.error('Failed to stop recording');
        }
      } else {
        // Start recording
        const success = startRecording('video');
        if (success) {
          setRecording(true);
          setDuration(0);
          message.info('Recording started...');
        } else {
          message.error('Failed to start recording. Check browser console.');
        }
      }
    } catch (error) {
      console.error('Recording error:', error);
      message.error('An error occurred during recording');
      setRecording(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      className={clsx(
        'relative flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded text-neutral-300 hover:bg-neutral-700/70 hover:text-white transition-colors',
        recording && 'bg-red-900/40 text-red-500'
      )}
      onClick={handleToggleRecord}
      title={recording ? 'Stop recording (click again to save)' : 'Start screen recording'}
    >
      <Circle
        size={18}
        fill={recording ? 'currentColor' : 'none'}
        className={recording ? 'text-red-500 animate-pulse' : ''}
      />
      {recording && (
        <span className="absolute text-[9px] font-bold text-red-500 pointer-events-none">
          {formatDuration(duration).slice(-2)}
        </span>
      )}
    </div>
  );
};
