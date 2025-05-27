
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

// Extend MediaTrackCapabilities to include torch
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

// Extend MediaTrackConstraintSet to include torch
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
  const processingInterval = useRef<number>();
  const recordingTimeout = useRef<number>();
  const countdownInterval = useRef<number>();

  const startCamera = async () => {
    try {
      setError('');
      setMeasurementComplete(false);
      setCurrentReadings(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStream(mediaStream);
        setIsActive(true);
        onProcessingChange(true);
        
        // Turn on flash for maximum accuracy
        await enableFlash(mediaStream);
        
        startProcessing();
        startRecordingTimer();
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permission and follow the tutorial for accurate measurements.');
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
        console.log('Flash enabled for maximum PPG signal accuracy');
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
        setIsFlashOn(false);
      } catch (error) {
        console.error('Failed to disable flash:', error);
        setIsFlashOn(false);
      }
    }
  };

  const stopCamera = async () => {
    console.log('Stopping camera and disabling flash...');
    
    // Disable flash first with current stream
    await disableFlash(stream);
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      setStream(null);
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
    setMeasurementComplete(true);
    onProcessingChange(false);
    
    // Store data for ML training and show final results
    if (redValues.current.length > 0) {
      const finalVitals = processSignalWithAI(redValues.current, userAge, userGender);
      setCurrentReadings(finalVitals);
      onVitalsUpdate(finalVitals);
      await storeDataForLearning(redValues.current, finalVitals);
    }
    
    redValues.current = [];
    console.log('Measurement completed - flash and camera turned off');
  };

  const storeDataForLearning = async (signalData: number[], vitalsData: any) => {
    try {
      const trainingData = {
        timestamp: new Date().toISOString(),
        signalData: signalData,
        vitalsData: vitalsData,
        userAge: userAge,
        userGender: userGender,
        signalQuality: signalQuality,
        accuracy: accuracy,
        sessionId: crypto.randomUUID()
      };
      
      // Store in localStorage for now (would be sent to server in production)
      const existingData = JSON.parse(localStorage.getItem('kaggle_medical_training_data') || '[]');
      existingData.push(trainingData);
      
      // Keep only last 100 sessions to manage storage
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100);
      }
      
      localStorage.setItem('kaggle_medical_training_data', JSON.stringify(existingData));
      console.log('Kaggle-enhanced training data stored for ML enhancement');
    } catch (error) {
      console.error('Failed to store training data:', error);
    }
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
      processingInterval.current = window.setInterval(processFrame, 33); // 30 FPS
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
    
    // Enhanced multi-region PPG signal extraction
    const centerRegions = [
      { x: 0.2, y: 0.2, w: 0.6, h: 0.6 }, // Center region
      { x: 0.3, y: 0.3, w: 0.4, h: 0.4 }, // Inner center
      { x: 0.25, y: 0.25, w: 0.5, h: 0.5 } // Medium center
    ];
    
    let bestSignalQuality = 0;
    let bestPpgSignal = 0;
    
    centerRegions.forEach(region => {
      const centerX = Math.floor(canvas.width * region.x);
      const centerY = Math.floor(canvas.height * region.y);
      const regionWidth = Math.floor(canvas.width * region.w);
      const regionHeight = Math.floor(canvas.height * region.h);
      
      let totalRed = 0, totalGreen = 0, totalBlue = 0, validPixels = 0;
      
      for (let y = centerY; y < centerY + regionHeight; y++) {
        for (let x = centerX; x < centerX + regionWidth; x++) {
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
        
        // Advanced PPG signal with multiple wavelength analysis
        const ppgSignal = isFlashOn ? 
          (avgRed * 1.5 - avgBlue * 0.3) / (avgGreen + 1) : // Enhanced red with blue compensation
          (avgRed * 1.2) / (avgGreen + avgBlue + 1);
        
        const signalStrength = avgRed + avgGreen + avgBlue;
        
        if (signalStrength > bestSignalQuality) {
          bestSignalQuality = signalStrength;
          bestPpgSignal = ppgSignal;
        }
      }
    });
    
    redValues.current.push(bestPpgSignal);
    
    // Keep samples for 15 seconds at 30 FPS (450 samples)
    if (redValues.current.length > 450) {
      redValues.current.shift();
    }

    // Process with enhanced accuracy when sufficient data available
    if (redValues.current.length > 90) { // Update every 3 seconds for real-time feedback
      const vitals = processSignalWithAI(redValues.current, userAge, userGender);
      setSignalQuality(vitals.confidence || 0);
      setAccuracy(vitals.accuracy || 0);
      onVitalsUpdate(vitals);
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
            <p className="text-green-700 font-medium">Kaggle-Enhanced Analysis Complete!</p>
            <div className="text-green-600 text-sm space-y-1">
              <p>Accuracy: {currentReadings.accuracy}% | Confidence: {currentReadings.confidence}%</p>
              <p>Flash disabled, data saved for AI learning</p>
            </div>
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
            Stop & Save
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
                {isFlashOn ? '🔬 Kaggle AI Flash Mode' : '🔬 Enhanced Kaggle AI Mode'}
              </div>
              {signalQuality > 0 && (
                <div className="text-xs mt-1">
                  Signal: {Math.round(signalQuality)}% | Kaggle AI Accuracy: {Math.round(accuracy)}%
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoCapture;
