import { useEffect, useRef, useState } from 'react';
import { processSignal } from '../utils/signalProcessor';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff } from 'lucide-react';

interface VideoCaptureProps {
  onVitalsUpdate: (vitals: any) => void;
  onProcessingChange: (processing: boolean) => void;
}

const VideoCapture = ({ onVitalsUpdate, onProcessingChange }: VideoCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string>('');
  
  const redValues = useRef<number[]>([]);
  const processingInterval = useRef<number>();

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 320 },
          height: { ideal: 240 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStream(mediaStream);
        setIsActive(true);
        onProcessingChange(true);
        startProcessing();
      }
    } catch (err) {
      setError('Camera access denied or not available. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }
    setIsActive(false);
    onProcessingChange(false);
    redValues.current = [];
  };

  const startProcessing = () => {
    if (!processingInterval.current) {
      processingInterval.current = window.setInterval(processFrame, 100); // 10 FPS
    }
  };

  const processFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Extract red channel average
    let totalRed = 0;
    const pixelCount = frame.data.length / 4;
    
    for (let i = 0; i < frame.data.length; i += 4) {
      totalRed += frame.data[i]; // red channel
    }
    
    const avgRed = totalRed / pixelCount;
    redValues.current.push(avgRed);
    
    // Keep only last 256 samples (about 25 seconds at 10 FPS)
    if (redValues.current.length > 256) {
      redValues.current.shift();
    }

    // Process signal when we have enough data
    if (redValues.current.length > 50) {
      const vitals = processSignal(redValues.current);
      onVitalsUpdate(vitals);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full rounded-lg bg-gray-900"
        autoPlay
        playsInline
        muted
        style={{ maxHeight: '300px' }}
      />
      <canvas
        ref={canvasRef}
        className="hidden"
      />
      
      {error && (
        <div className="absolute inset-0 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center p-4">
          <div className="text-center">
            <CameraOff className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        {!isActive ? (
          <Button onClick={startCamera} className="bg-green-500 hover:bg-green-600">
            <Camera className="w-4 h-4 mr-2" />
            Start Analysis
          </Button>
        ) : (
          <Button onClick={stopCamera} variant="destructive">
            <CameraOff className="w-4 h-4 mr-2" />
            Stop Analysis
          </Button>
        )}
      </div>
      
      {isActive && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Recording</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCapture;
