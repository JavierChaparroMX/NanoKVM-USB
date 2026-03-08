/**
 * Video recording utility for capturing the video stream
 */

interface RecorderState {
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
  chunks: Blob[];
  startTime: number;
}

let recorderState: RecorderState = {
  isRecording: false,
  mediaRecorder: null,
  chunks: [],
  startTime: 0
};

/**
 * Get the best supported MIME type for recording
 */
function getBestMimeType(): string {
  // List of MIME types to try, in order of preference
  const mimeTypes = [
    'video/mp4;codecs=h264,aac',
    'video/mp4;codecs=h.264,aac',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ];

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      console.log(`Using MIME type: ${mimeType}`);
      return mimeType;
    }
  }

  // Fallback to default
  console.warn('No preferred MIME type supported, using default');
  return 'video/mp4';
}

/**
 * Get file extension based on MIME type
 */
function getFileExtension(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('webm')) return 'webm';
  return 'mp4';
}

/**
 * Start recording the video stream
 */
export function startRecording(videoElementId: string = 'video'): boolean {
  try {
    if (recorderState.isRecording) {
      console.warn('Recording already in progress');
      return false;
    }

    const videoElement = document.getElementById(videoElementId) as HTMLVideoElement;
    if (!videoElement || !videoElement.srcObject) {
      console.error('Video element not found or no stream available');
      return false;
    }
    
    // Create a canvas to capture the video with consistent quality
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return false;
    }

    // Get canvas stream
    const canvasStream = canvas.captureStream(30); // 30 FPS

    // Get best supported MIME type
    const mimeType = getBestMimeType();

    // Create media recorder with canvas stream
    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType: mimeType
    });

    recorderState.mediaRecorder = mediaRecorder;
    recorderState.chunks = [];
    recorderState.isRecording = true;
    recorderState.startTime = Date.now();

    // Draw video frames to canvas continuously
    const drawFrame = () => {
      if (!recorderState.isRecording) return;
      ctx.drawImage(videoElement, 0, 0);
      requestAnimationFrame(drawFrame);
    };
    drawFrame();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recorderState.chunks.push(event.data);
      }
    };

    mediaRecorder.start();
    return true;
  } catch (error) {
    console.error('Failed to start recording:', error);
    recorderState.isRecording = false;
    return false;
  }
}

/**
 * Stop recording and save the video
 */
export function stopRecording(): boolean {
  try {
    if (!recorderState.isRecording || !recorderState.mediaRecorder) {
      console.warn('No recording in progress');
      return false;
    }

    const mimeType = recorderState.mediaRecorder.mimeType;
    recorderState.mediaRecorder.stop();
    recorderState.isRecording = false;

    // Wait for all data to be collected
    setTimeout(() => {
      if (recorderState.chunks.length > 0) {
        const blob = new Blob(recorderState.chunks, { type: mimeType });
        downloadVideo(blob, mimeType);
        recorderState.chunks = [];
      }
    }, 100);

    return true;
  } catch (error) {
    console.error('Failed to stop recording:', error);
    return false;
  }
}

/**
 * Check if recording is active
 */
export function isRecording(): boolean {
  return recorderState.isRecording;
}

/**
 * Download the recorded video
 */
function downloadVideo(blob: Blob, mimeType: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  // Generate filename with timestamp and appropriate extension
  const date = new Date();
  const extension = getFileExtension(mimeType);
  const filename = `recording-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}-${String(date.getSeconds()).padStart(2, '0')}.${extension}`;

  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get recording duration in seconds
 */
export function getRecordingDuration(): number {
  if (!recorderState.isRecording) return 0;
  return Math.floor((Date.now() - recorderState.startTime) / 1000);
}
