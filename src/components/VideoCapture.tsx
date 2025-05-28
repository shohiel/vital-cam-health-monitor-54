
import React, { useEffect, useRef, useState } from 'react';
import { processSignalWithAI } from '../utils/advancedSignalProcessor';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Zap, Info } from 'lucide-react';
import TutorialVideo from './TutorialVideo';

interface VideoCaptureProps {
  onVitalsUpdate: (vitals: any) => void;
  onProcessingChange: (processing: boolean) => void;
  userAge?: number;
  userGender?: string;
}

interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

interface ExtendedMediaTrackConstraintSet extends MediaTrackConstraintSet {
  torch?: boolean;
}

const VideoCapture = ({ onVitalsUpdate, onProcessingChange, userAge, userGender }: VideoCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [signalQuality, setSignalQuality] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [measurementComplete, setMeasurementComplete] = useState(false);
  const [currentReadings, setCurrentReadings] = useState<any>(null);
  
  const redValues = useRef<number[]>([]);
  const greenValues = useRef<number[]>([]);
  const blueValues = useRef<number[]>([]);
  const processingInterval = useRef<number>();
  const recordingTimeout = useRef<number>();
  const countdownInterval = useRef<number>();

  const startCamera = async () => {
    try {
      setError('');
      setMeasurementComplete(false);
      setCurrentReadings(null);
      redValues.current = [];
      greenValues.current = [];
      blueValues.current = [];
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 60, min: 30 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStream(mediaStream);
        setIsActive(true);
        onProcessingChange(true);
        
        // Enable flash for enhanced accuracy
        await enableFlash(mediaStream);
        
        startProcessing();
        startRecordingTimer();
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permission and ensure proper finger placement over the camera.');
      console.error('Camera error:', err);
    }
  };

  const enableFlash = async (mediaStream: MediaStream) => {
    try {
      const videoTrack = mediaStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities() as ExtendedMediaTrackCapabilities;
      
      if (capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: true } as ExtendedMediaTrackConstraintSet]
        });
        setIsFlashOn(true);
        console.log('Flash enabled for Kaggle AI accuracy');
      } else {
        console.log('Flash not supported - using enhanced camera mode');
        setIsFlashOn(false);
      }
    } catch (error) {
      console.error('Flash control failed:', error);
      setIsFlashOn(false);
    }
  };

  const disableFlash = async (currentStream?: MediaStream) => {
    const streamToUse = currentStream || stream;
    if (streamToUse && isFlashOn) {
      try {
        const videoTrack = streamToUse.getVideoTracks()[0];
        if (videoTrack && videoTrack.readyState === 'live') {
          await videoTrack.applyConstraints({
            advanced: [{ torch: false } as ExtendedMediaTrackConstraintSet]
          });
          console.log('Flash disabled successfully');
        }
      } catch (error) {
        console.error('Failed to disable flash:', error);
      }
    }
    setIsFlashOn(false);
  };

  const stopCamera = async () => {
    console.log('Stopping camera and processing final Kaggle AI measurements...');
    
    // Process final measurements BEFORE stopping camera
    if (redValues.current.length > 150) {
      console.log('Processing final Kaggle measurements with', redValues.current.length, 'samples');
      const finalVitals = processSignalWithAI(
        redValues.current, 
        greenValues.current,
        blueValues.current,
        userAge, 
        userGender
      );
      
      setCurrentReadings(finalVitals);
      onVitalsUpdate(finalVitals);
      setMeasurementComplete(true);
      
      console.log('Final Kaggle measurements:', finalVitals);
    }
    
    // Disable flash first
    await disableFlash(stream);
    
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      setStream(null);
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Clear all intervals and timeouts
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
      processingInterval.current = undefined;
    }
    if (recordingTimeout.current) {
      clearTimeout(recordingTimeout.current);
      recordingTimeout.current = undefined;
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = undefined;
    }
    
    setIsActive(false);
    setTimeRemaining(15);
    onProcessingChange(false);
    
    if (redValues.current.length <= 150) {
      setError('Insufficient data for accurate measurement. Please try again with proper finger placement.');
    }
    
    // Clear data arrays
    redValues.current = [];
    greenValues.current = [];
    blueValues.current = [];
  };

  const startRecordingTimer = () => {
    setTimeRemaining(15);
    
    countdownInterval.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          stopCamera();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    recordingTimeout.current = window.setTimeout(() => {
      stopCamera();
    }, 15000);
  };

  const startProcessing = () => {
    if (!processingInterval.current) {
      processingInterval.current = window.setInterval(processFrame, 16); // 60 FPS
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

    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Kaggle AI multi-region analysis for maximum accuracy
    const regions = [
      { x: 0.3, y: 0.3, w: 0.4, h: 0.4 }, // Center
      { x: 0.25, y: 0.25, w: 0.5, h: 0.5 }, // Outer
      { x: 0.35, y: 0.35, w: 0.3, h: 0.3 }, // Inner
      { x: 0.28, y: 0.28, w: 0.44, h: 0.44 }, // Mid
    ];
    
    let bestSignalQuality = 0;
    let bestRed = 0, bestGreen = 0, bestBlue = 0;
    
    regions.forEach(region => {
      const centerX = Math.floor(canvas.width * region.x);
      const centerY = Math.floor(canvas.height * region.y);
      const regionWidth = Math.floor(canvas.width * region.w);
      const regionHeight = Math.floor(canvas.height * region.h);
      
      let totalRed = 0, totalGreen = 0, totalBlue = 0, validPixels = 0;
      
      for (let y = centerY; y < centerY + regionHeight; y += 2) {
        for (let x = centerX; x < centerX + regionWidth; x += 2) {
          const i = (y * canvas.width + x) * 4;
          if (i < frame.data.length) {
            totalRed += frame.data[i];
            totalGreen += frame.data[i + 1];
            totalBlue += frame.data[i + 2];
            validPixels++;
          }
        }
      }
      
      if (validPixels > 0) {
        const avgRed = totalRed / validPixels;
        const avgGreen = totalGreen / validPixels;
        const avgBlue = totalBlue / validPixels;
        
        // Enhanced Kaggle signal quality assessment
        const signalStrength = avgRed + avgGreen + avgBlue;
        const redDominance = avgRed / (avgGreen + avgBlue + 1);
        const qualityScore = signalStrength * redDominance * (isFlashOn ? 1.8 : 1.2);
        
        if (qualityScore > bestSignalQuality) {
          bestSignalQuality = qualityScore;
          bestRed = avgRed;
          bestGreen = avgGreen;
          bestBlue = avgBlue;
        }
      }
    });
    
    // Store high-quality samples for Kaggle processing
    if (bestSignalQuality > 120) { // Enhanced threshold
      redValues.current.push(bestRed);
      greenValues.current.push(bestGreen);
      blueValues.current.push(bestBlue);
      
      // Keep samples for 15 seconds at 60 FPS (900 samples max)
      if (redValues.current.length > 900) {
        redValues.current.shift();
        greenValues.current.shift();
        blueValues.current.shift();
      }

      // Real-time Kaggle AI feedback
      if (redValues.current.length > 180 && redValues.current.length % 60 === 0) {
        const vitals = processSignalWithAI(
          redValues.current.slice(-300), // Last 5 seconds
          greenValues.current.slice(-300),
          blueValues.current.slice(-300),
          userAge, 
          userGender
        );
        
        setSignalQuality(vitals.confidence || 0);
        setAccuracy(vitals.accuracy || 0);
        
        // Update UI with stable Kaggle readings
        if (vitals.confidence > 75) {
          onVitalsUpdate(vitals);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        disableFlash(stream).then(() => {
          stream.getTracks().forEach(track => track.stop());
        });
      }
      if (processingInterval.current) clearInterval(processingInterval.current);
      if (recordingTimeout.current) clearTimeout(recordingTimeout.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [stream]);

  if (showTutorial) {
    return <TutorialVideo onTutorialComplete={() => setShowTutorial(false)} />;
  }

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
      <canvas ref={canvasRef} className="hidden" />
      
      {error && (
        <div className="absolute inset-0 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center p-4">
          <div className="text-center">
            <CameraOff className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 text-sm mb-3">{error}</p>
            <Button onClick={() => setShowTutorial(true)} size="sm" className="bg-blue-500 hover:bg-blue-600">
              <Info className="w-4 h-4 mr-2" />
              View Tutorial
            </Button>
          </div>
        </div>
      )}
      
      {measurementComplete && currentReadings && (
        <div className="absolute inset-0 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">✓</span>
            </div>
            <p className="text-green-700 font-medium">Kaggle AI Analysis Complete!</p>
            <div className="text-green-600 text-sm space-y-1 mt-2">
              <p>Heart Rate: {currentReadings.heartRate} bpm</p>
              <p>SpO₂: {currentReadings.spO2}%</p>
              <p>Blood Sugar: {currentReadings.glucose} mmol/L</p>
              <p>Accuracy: {currentReadings.accuracy}%</p>
            </div>
            <Button 
              onClick={() => setMeasurementComplete(false)} 
              size="sm" 
              className="mt-3 bg-green-600 hover:bg-green-700"
            >
              Continue
            </Button>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <Button onClick={() => setShowTutorial(true)} size="sm" variant="outline" className="bg-blue-50 hover:bg-blue-100">
          <Info className="w-4 h-4 mr-2" />
          Tutorial
        </Button>
        
        {!isActive ? (
          <Button onClick={startCamera} className="bg-green-500 hover:bg-green-600">
            <Camera className="w-4 h-4 mr-2" />
            Start Kaggle AI Analysis
          </Button>
        ) : (
          <Button onClick={stopCamera} variant="destructive">
            <CameraOff className="w-4 h-4 mr-2" />
            Stop & Analyze
          </Button>
        )}
      </div>
      
      {isActive && (
        <>
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Kaggle AI Recording</span>
              {isFlashOn && <Zap className="w-3 h-3" />}
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {timeRemaining}s
            </div>
          </div>
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="text-white text-center text-sm bg-black bg-opacity-70 px-3 py-2 rounded">
              <div className="font-medium">
                {isFlashOn ? '🤖 Kaggle AI Flash Mode' : '🤖 Kaggle AI Enhanced Mode'}
              </div>
              {signalQuality > 0 && (
                <div className="text-xs mt-1">
                  Signal: {Math.round(signalQuality)}% | Accuracy: {Math.round(accuracy)}%
                </div>
              )}
              <div className="text-xs mt-1">
                Samples: {redValues.current.length} | Quality: Enhanced
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoCapture;
