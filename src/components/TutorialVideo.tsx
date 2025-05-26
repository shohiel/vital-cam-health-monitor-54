
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';

interface TutorialVideoProps {
  onTutorialComplete: () => void;
}

const TutorialVideo = ({ onTutorialComplete }: TutorialVideoProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const tutorialSteps = [
    {
      title: "Prepare Your Device",
      description: "Ensure your device camera and flash are clean and working properly",
      image: "📱",
      instructions: [
        "Clean your camera lens with a soft cloth",
        "Make sure your device has good battery level",
        "Close other camera apps if running"
      ]
    },
    {
      title: "Finger Placement",
      description: "Place your index finger gently over the rear camera and flash",
      image: "👆",
      instructions: [
        "Use your index finger (not thumb)",
        "Cover both camera lens AND flash completely", 
        "Apply gentle pressure - don't press too hard",
        "Keep finger steady and still"
      ]
    },
    {
      title: "Optimal Positioning",
      description: "Position your finger to create the best seal for accurate readings",
      image: "🎯",
      instructions: [
        "Finger should cover the entire camera lens",
        "Flash should be completely covered by fingertip",
        "Avoid gaps around the edges",
        "Keep finger flat against the camera"
      ]
    },
    {
      title: "During Measurement",
      description: "Stay completely still for the full 10-second measurement",
      image: "⏱️",
      instructions: [
        "Don't move your finger during recording",
        "Breathe normally and stay relaxed",
        "Avoid talking or sudden movements",
        "Wait for the full 10 seconds to complete"
      ]
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onTutorialComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetTutorial = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <Info className="w-5 h-5 mr-2 text-blue-500" />
          How to Take Accurate Measurements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center space-x-2">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-2">
            Step {currentStep + 1} of {tutorialSteps.length}
          </span>
        </div>

        {/* Current Step Content */}
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">{tutorialSteps[currentStep].image}</div>
          <h3 className="text-xl font-bold text-gray-800">
            {tutorialSteps[currentStep].title}
          </h3>
          <p className="text-gray-600 mb-4">
            {tutorialSteps[currentStep].description}
          </p>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
            <ul className="text-left space-y-2">
              {tutorialSteps[currentStep].instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-sm text-gray-700">{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            <Button onClick={resetTutorial} variant="ghost" size="sm">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={nextStep}
            className="bg-blue-500 hover:bg-blue-600"
            size="sm"
          >
            {currentStep === tutorialSteps.length - 1 ? 'Start Measurement' : 'Next'}
          </Button>
        </div>

        {/* AI Accuracy Notice */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
          <div className="text-sm text-gray-700">
            <p className="font-medium text-green-700 mb-2">🤖 AI-Enhanced Accuracy</p>
            <ul className="space-y-1 text-xs">
              <li>• Machine learning algorithms analyze PPG signals</li>
              <li>• Dataset-based blood pressure estimation</li>
              <li>• Real-time signal quality optimization</li>
              <li>• Adaptive filtering for enhanced precision</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorialVideo;
