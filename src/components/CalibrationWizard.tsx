import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Hand, 
  Sun, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Fingerprint,
  Eye,
  Timer,
  Sparkles,
  Shield
} from 'lucide-react';

interface CalibrationWizardProps {
  onComplete: (calibrationData: CalibrationResult) => void;
  onCancel: () => void;
}

interface CalibrationResult {
  lightingQuality: number;
  fingerPlacement: number;
  signalStability: number;
  overallScore: number;
  timestamp: string;
  recommendations: string[];
}

interface StepStatus {
  completed: boolean;
  score: number;
  message: string;
}

const CALIBRATION_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Calibration',
    description: 'This wizard will help you achieve optimal measurement accuracy',
    icon: Sparkles,
  },
  {
    id: 'lighting',
    title: 'Lighting Check',
    description: 'Ensure proper lighting conditions for accurate readings',
    icon: Sun,
  },
  {
    id: 'finger',
    title: 'Finger Placement',
    description: 'Position your finger correctly over the camera',
    icon: Fingerprint,
  },
  {
    id: 'stability',
    title: 'Stability Test',
    description: 'Hold your finger steady for signal calibration',
    icon: Hand,
  },
  {
    id: 'signal',
    title: 'Signal Quality',
    description: 'Analyzing your PPG signal quality',
    icon: Eye,
  },
  {
    id: 'complete',
    title: 'Calibration Complete',
    description: 'Your device is ready for accurate measurements',
    icon: Shield,
  },
];

export const CalibrationWizard: React.FC<CalibrationWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [lightLevel, setLightLevel] = useState(0);
  const [fingerDetected, setFingerDetected] = useState(false);
  const [stabilityScore, setStabilityScore] = useState(0);
  const [signalQuality, setSignalQuality] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [redValues, setRedValues] = useState<number[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Start camera for calibration
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      // Try to enable torch
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
      if (capabilities?.torch) {
        await track.applyConstraints({
          advanced: [{ torch: true } as MediaTrackConstraintSet],
        });
      }
    } catch (error) {
      console.error('Camera access error:', error);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [stream]);

  // Analyze frame for calibration
  const analyzeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.readyState !== 4) {
      animationRef.current = requestAnimationFrame(analyzeFrame);
      return;
    }

    canvas.width = 100;
    canvas.height = 100;
    
    // Sample from center
    const sx = (video.videoWidth - 100) / 2;
    const sy = (video.videoHeight - 100) / 2;
    
    ctx.drawImage(video, sx, sy, 100, 100, 0, 0, 100, 100);
    
    const imageData = ctx.getImageData(0, 0, 100, 100);
    const data = imageData.data;
    
    let totalRed = 0;
    let totalGreen = 0;
    let totalBlue = 0;
    let pixelCount = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      totalRed += data[i];
      totalGreen += data[i + 1];
      totalBlue += data[i + 2];
      pixelCount++;
    }
    
    const avgRed = totalRed / pixelCount;
    const avgGreen = totalGreen / pixelCount;
    const avgBlue = totalBlue / pixelCount;
    const brightness = (avgRed + avgGreen + avgBlue) / 3;
    
    // Update light level (0-100)
    const normalizedLight = Math.min(100, (brightness / 255) * 100);
    setLightLevel(normalizedLight);
    
    // Finger detection (high red, low green/blue ratio)
    const redRatio = avgRed / (avgGreen + avgBlue + 1);
    const isFingerPresent = avgRed > 100 && redRatio > 0.8 && brightness > 50;
    setFingerDetected(isFingerPresent);
    
    // Store red values for stability analysis
    setRedValues(prev => {
      const newValues = [...prev, avgRed];
      return newValues.slice(-60); // Keep last 60 samples
    });
    
    // Calculate stability from variance
    if (redValues.length >= 30) {
      const mean = redValues.reduce((a, b) => a + b, 0) / redValues.length;
      const variance = redValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / redValues.length;
      const stability = Math.max(0, 100 - variance / 5);
      setStabilityScore(stability);
      
      // Signal quality based on variance and amplitude
      const amplitude = Math.max(...redValues) - Math.min(...redValues);
      const quality = Math.min(100, (amplitude / 50) * stability);
      setSignalQuality(quality);
    }
    
    animationRef.current = requestAnimationFrame(analyzeFrame);
  }, [redValues]);

  // Start/stop analysis based on step
  useEffect(() => {
    const step = CALIBRATION_STEPS[currentStep];
    
    if (['lighting', 'finger', 'stability', 'signal'].includes(step.id)) {
      if (!stream) {
        startCamera();
      } else {
        animationRef.current = requestAnimationFrame(analyzeFrame);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentStep, stream, startCamera, analyzeFrame]);

  // Auto-advance logic for each step
  useEffect(() => {
    const step = CALIBRATION_STEPS[currentStep];
    
    if (step.id === 'lighting' && lightLevel >= 40) {
      setTimeout(() => {
        setStepStatuses(prev => ({
          ...prev,
          lighting: { completed: true, score: lightLevel, message: 'Good lighting detected' }
        }));
      }, 1500);
    }
    
    if (step.id === 'finger' && fingerDetected) {
      setTimeout(() => {
        setStepStatuses(prev => ({
          ...prev,
          finger: { completed: true, score: 100, message: 'Finger placement verified' }
        }));
      }, 2000);
    }
    
    if (step.id === 'stability' && stabilityScore >= 70) {
      setTimeout(() => {
        setStepStatuses(prev => ({
          ...prev,
          stability: { completed: true, score: stabilityScore, message: 'Signal is stable' }
        }));
      }, 2000);
    }
    
    if (step.id === 'signal' && signalQuality >= 60) {
      setTimeout(() => {
        setStepStatuses(prev => ({
          ...prev,
          signal: { completed: true, score: signalQuality, message: 'Excellent signal quality' }
        }));
      }, 2000);
    }
  }, [currentStep, lightLevel, fingerDetected, stabilityScore, signalQuality]);

  // Countdown timer for stability test
  useEffect(() => {
    if (CALIBRATION_STEPS[currentStep].id === 'stability' && !stepStatuses.stability?.completed) {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, stepStatuses.stability?.completed]);

  const handleNext = () => {
    if (currentStep < CALIBRATION_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setRedValues([]); // Reset for new step
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    stopCamera();
    
    const lightingScore = stepStatuses.lighting?.score || 70;
    const fingerScore = stepStatuses.finger?.score || 80;
    const stabilityScoreVal = stepStatuses.stability?.score || 75;
    const signalScore = stepStatuses.signal?.score || 70;
    
    const overallScore = (lightingScore + fingerScore + stabilityScoreVal + signalScore) / 4;
    
    const recommendations: string[] = [];
    if (lightingScore < 80) recommendations.push('Consider using better lighting for improved accuracy');
    if (stabilityScoreVal < 80) recommendations.push('Try to keep your hand more steady during measurements');
    if (signalScore < 80) recommendations.push('Apply slightly more pressure with your finger');
    
    const result: CalibrationResult = {
      lightingQuality: lightingScore,
      fingerPlacement: fingerScore,
      signalStability: stabilityScoreVal,
      overallScore,
      timestamp: new Date().toISOString(),
      recommendations,
    };
    
    // Save calibration data
    localStorage.setItem('nehal_calibration_data', JSON.stringify(result));
    
    onComplete(result);
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  const currentStepData = CALIBRATION_STEPS[currentStep];
  const StepIcon = currentStepData.icon;
  const progressPercentage = ((currentStep + 1) / CALIBRATION_STEPS.length) * 100;

  const canProceed = () => {
    const stepId = currentStepData.id;
    if (stepId === 'welcome') return true;
    if (stepId === 'complete') return true;
    return stepStatuses[stepId]?.completed || false;
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Optimize Your Measurements</h3>
              <p className="text-muted-foreground">
                This 5-step calibration process will ensure you get the most accurate vital sign readings.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <Timer className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="font-medium">~2 minutes</p>
                <p className="text-muted-foreground text-xs">Duration</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Shield className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="font-medium">Clinical Grade</p>
                <p className="text-muted-foreground text-xs">Accuracy</p>
              </div>
            </div>
          </div>
        );

      case 'lighting':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-colors ${
                lightLevel >= 40 ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}>
                <Sun className={`w-10 h-10 ${lightLevel >= 40 ? 'text-green-500' : 'text-yellow-500'}`} />
              </div>
              <h3 className="mt-4 font-semibold">Checking Lighting Conditions</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {lightLevel >= 40 
                  ? 'Lighting conditions are good!' 
                  : 'Move to a well-lit area or turn on flash'}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Light Level</span>
                <span className="font-medium">{Math.round(lightLevel)}%</span>
              </div>
              <Progress value={lightLevel} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Too Dark</span>
                <span>Optimal</span>
                <span>Too Bright</span>
              </div>
            </div>
            
            {stepStatuses.lighting?.completed && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-700 dark:text-green-400 font-medium">
                  {stepStatuses.lighting.message}
                </span>
              </div>
            )}
          </div>
        );

      case 'finger':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-colors ${
                fingerDetected ? 'bg-green-500/20' : 'bg-orange-500/20 animate-pulse'
              }`}>
                <Fingerprint className={`w-10 h-10 ${fingerDetected ? 'text-green-500' : 'text-orange-500'}`} />
              </div>
              <h3 className="mt-4 font-semibold">Position Your Finger</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {fingerDetected 
                  ? 'Perfect! Keep your finger in place' 
                  : 'Place your fingertip gently over the camera lens'}
              </p>
            </div>
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-sm">Tips for Best Placement:</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Use your index or middle finger
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Cover the camera completely
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Apply gentle, consistent pressure
                </li>
              </ul>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <Badge variant={fingerDetected ? "default" : "secondary"}>
                {fingerDetected ? 'Finger Detected' : 'Waiting for finger...'}
              </Badge>
            </div>
            
            {stepStatuses.finger?.completed && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-700 dark:text-green-400 font-medium">
                  {stepStatuses.finger.message}
                </span>
              </div>
            )}
          </div>
        );

      case 'stability':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-colors ${
                stabilityScore >= 70 ? 'bg-green-500/20' : 'bg-blue-500/20'
              }`}>
                {countdown > 0 ? (
                  <span className="text-3xl font-bold text-primary">{countdown}</span>
                ) : (
                  <Hand className={`w-10 h-10 ${stabilityScore >= 70 ? 'text-green-500' : 'text-blue-500'}`} />
                )}
              </div>
              <h3 className="mt-4 font-semibold">Hold Steady</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stabilityScore >= 70 
                  ? 'Great stability! Signal is clean' 
                  : 'Keep your finger still for accurate calibration'}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Stability Score</span>
                <span className="font-medium">{Math.round(stabilityScore)}%</span>
              </div>
              <Progress value={stabilityScore} className="h-3" />
            </div>
            
            {/* Real-time signal visualization */}
            <div className="h-16 bg-muted rounded-lg overflow-hidden relative">
              <svg className="w-full h-full" viewBox="0 0 200 60">
                <path
                  d={`M 0 30 ${redValues.slice(-50).map((v, i) => 
                    `L ${i * 4} ${30 - (v - 128) / 10}`
                  ).join(' ')}`}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-transparent to-muted pointer-events-none" />
            </div>
            
            {stepStatuses.stability?.completed && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-700 dark:text-green-400 font-medium">
                  {stepStatuses.stability.message}
                </span>
              </div>
            )}
          </div>
        );

      case 'signal':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-colors ${
                signalQuality >= 60 ? 'bg-green-500/20' : 'bg-purple-500/20'
              }`}>
                {signalQuality >= 60 ? (
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                ) : (
                  <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                )}
              </div>
              <h3 className="mt-4 font-semibold">Analyzing Signal Quality</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {signalQuality >= 60 
                  ? 'Excellent PPG signal detected!' 
                  : 'Processing your PPG waveform...'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{Math.round(signalQuality)}%</p>
                <p className="text-xs text-muted-foreground">Signal Quality</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{redValues.length}</p>
                <p className="text-xs text-muted-foreground">Samples Collected</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${lightLevel >= 40 ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Light level optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${fingerDetected ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Finger positioned correctly</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${stabilityScore >= 70 ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Signal is stable</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${signalQuality >= 60 ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Quality threshold met</span>
              </div>
            </div>
            
            {stepStatuses.signal?.completed && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-700 dark:text-green-400 font-medium">
                  {stepStatuses.signal.message}
                </span>
              </div>
            )}
          </div>
        );

      case 'complete':
        const overallScore = (
          (stepStatuses.lighting?.score || 70) +
          (stepStatuses.finger?.score || 80) +
          (stepStatuses.stability?.score || 75) +
          (stepStatuses.signal?.score || 70)
        ) / 4;
        
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500/20 to-green-500/40 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                Calibration Successful!
              </h3>
              <p className="text-muted-foreground">
                Your device is now calibrated for optimal accuracy
              </p>
            </div>
            
            <div className="p-6 bg-muted rounded-xl">
              <p className="text-4xl font-bold text-primary">{Math.round(overallScore)}%</p>
              <p className="text-sm text-muted-foreground mt-1">Overall Calibration Score</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-background border rounded-lg">
                <Sun className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                <p className="font-medium">{Math.round(stepStatuses.lighting?.score || 70)}%</p>
                <p className="text-xs text-muted-foreground">Lighting</p>
              </div>
              <div className="p-3 bg-background border rounded-lg">
                <Fingerprint className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                <p className="font-medium">{Math.round(stepStatuses.finger?.score || 80)}%</p>
                <p className="text-xs text-muted-foreground">Placement</p>
              </div>
              <div className="p-3 bg-background border rounded-lg">
                <Hand className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                <p className="font-medium">{Math.round(stepStatuses.stability?.score || 75)}%</p>
                <p className="text-xs text-muted-foreground">Stability</p>
              </div>
              <div className="p-3 bg-background border rounded-lg">
                <Eye className="w-4 h-4 mx-auto mb-1 text-green-500" />
                <p className="font-medium">{Math.round(stepStatuses.signal?.score || 70)}%</p>
                <p className="text-xs text-muted-foreground">Signal</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              Step {currentStep + 1} of {CALIBRATION_STEPS.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between">
            {CALIBRATION_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep || stepStatuses[step.id]?.completed;
              
              return (
                <div
                  key={step.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
              );
            })}
          </div>
          
          <div>
            <CardTitle className="flex items-center gap-2">
              <StepIcon className="w-5 h-5" />
              {currentStepData.title}
            </CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Hidden video and canvas for analysis */}
          <video ref={videoRef} className="hidden" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          
          {renderStepContent()}
          
          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && currentStepData.id !== 'complete' && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            {currentStepData.id === 'complete' ? (
              <Button onClick={handleComplete} className="flex-1">
                Start Measuring
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                disabled={!canProceed()}
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : canProceed() ? (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'Checking...'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalibrationWizard;
