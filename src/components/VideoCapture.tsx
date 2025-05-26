import React, { useEffect, useRef, useState } from 'react';
import { processSignal } from '../utils/signalProcessor';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Zap } from 'lucide-react';

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
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [isFlashOn, setIsFlashOn] = useState(false);
  
  const redValues = useRef<number[]>([]);
  const processingInterval = useRef<number>();
  const recordingTimeout = useRef<number>();
  const countdownInterval = useRef<number>();

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStream(mediaStream);
        setIsActive(true);
        onProcessingChange(true);
        
        // Turn on flash/torch
        await enableFlash(mediaStream);
        
        startProcessing();
        startRecordingTimer();
      }
    } catch (err) {
      setError('Camera access denied or not available. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const enableFlash = async (mediaStream: MediaStream) => {
    try {
      const videoTrack = mediaStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      
      if (capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: true }]
        });
        setIsFlashOn(true);
        console.log('Flash/torch enabled for PPG measurement');
      } else {
        console.log('Torch not supported on this device');
      }
    } catch (error) {
      console.error('Failed to enable flash:', error);
    }
  };

  const disableFlash = async () => {
    if (stream && isFlashOn) {
      try {
        const videoTrack = stream.getVideoTracks()[0];
        await videoTrack.applyConstraints({
          advanced: [{ torch: false }]
        });
        setIsFlashOn(false);
        console.log('Flash/torch disabled');
      } catch (error) {
        console.error('Failed to disable flash:', error);
      }
    }
  };

  const stopCamera = async () => {
    await disableFlash();
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }
    if (recordingTimeout.current) {
      clearTimeout(recordingTimeout.current);
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
    setIsActive(false);
    setTimeRemaining(10);
    onProcessingChange(false);
    redValues.current = [];
  };

  const startRecordingTimer = () => {
    setTimeRemaining(10);
    
    countdownInterval.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          stopCamera();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    // Automatically stop after exactly 10 seconds
    recordingTimeout.current = window.setTimeout(() => {
      stopCamera();
    }, 10000);
  };

  const startProcessing = () => {
    if (!processingInterval.current) {
      processingInterval.current = window.setInterval(processFrame, 33); // 30 FPS for better accuracy
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

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Extract red channel average with enhanced processing
    let totalRed = 0;
    let totalGreen = 0;
    let totalBlue = 0;
    const pixelCount = frame.data.length / 4;
    
    for (let i = 0; i < frame.data.length; i += 4) {
      totalRed += frame.data[i];     // red channel
      totalGreen += frame.data[i + 1]; // green channel  
      totalBlue += frame.data[i + 2];  // blue channel
    }
    
    const avgRed = totalRed / pixelCount;
    const avgGreen = totalGreen / pixelCount;
    const avgBlue = totalBlue / pixelCount;
    
    // Use red-green ratio for better PPG signal with flash
    const ppgSignal = avgRed / (avgGreen + 1);
    redValues.current.push(ppgSignal);
    
    // Keep samples for 10 seconds at 30 FPS (300 samples)
    if (redValues.current.length > 300) {
      redValues.current.shift();
    }

    // Process signal when we have enough data (minimum 3 seconds)
    if (redValues.current.length > 90) {
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
        style={{ maxHeight: '400px' }}
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
            Start Flash Analysis
          </Button>
        ) : (
          <Button onClick={stopCamera} variant="destructive">
            <CameraOff className="w-4 h-4 mr-2" />
            Stop Analysis
          </Button>
        )}
      </div>
      
      {isActive && (
        <>
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Recording</span>
              {isFlashOn && <Zap className="w-3 h-3" />}
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {timeRemaining}s
            </div>
          </div>
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="text-white text-center text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
              {isFlashOn ? '🔦 Flash Active' : '📷 Camera Mode'}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoCapture;
