
import { useState, useEffect, useRef } from 'react';
import VideoCapture from '../components/VideoCapture';
import VitalsDisplay from '../components/VitalsDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Activity, Droplets, Zap } from 'lucide-react';

const Index = () => {
  const [vitals, setVitals] = useState({
    heartRate: null,
    spO2: null,
    glucose: null,
    viscosity: null
  });

  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-500 mr-2 animate-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Health Vitals
            </h1>
          </div>
          <p className="text-gray-600">PPG-based vital signs monitoring</p>
        </div>

        {/* Camera Section */}
        <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Camera Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <VideoCapture 
              onVitalsUpdate={setVitals} 
              onProcessingChange={setIsProcessing}
            />
          </CardContent>
        </Card>

        {/* Vitals Display */}
        <VitalsDisplay vitals={vitals} isProcessing={isProcessing} />

        {/* Instructions */}
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-medium text-gray-800 mb-3">📱 Instructions:</p>
              <ul className="space-y-1 ml-4">
                <li>• Allow camera access when prompted</li>
                <li>• Place fingertip gently over the camera lens</li>
                <li>• Ensure good lighting conditions</li>
                <li>• Hold steady for accurate readings</li>
              </ul>
              <p className="text-xs text-gray-500 mt-4">
                * This is a demonstration app. Consult healthcare professionals for medical advice.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
