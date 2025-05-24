
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Droplets, Zap, Bluetooth, Camera, Save } from 'lucide-react';
import VideoCapture from '../components/VideoCapture';
import BluetoothConnector from '../components/BluetoothConnector';
import VitalsHistory from '../components/VitalsHistory';
import { useToast } from '@/hooks/use-toast';

interface VitalsData {
  heartRate: number | null;
  spO2: number | null;
  bloodPressure: string | null;
  bloodSugar: number | null;
  bloodViscosity: number | null;
  timestamp?: string;
}

const VitalsMonitor = () => {
  const [vitals, setVitals] = useState<VitalsData>({
    heartRate: null,
    spO2: null,
    bloodPressure: null,
    bloodSugar: null,
    bloodViscosity: null
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [vitalsHistory, setVitalsHistory] = useState<VitalsData[]>([]);
  const { toast } = useToast();

  const handleVitalsUpdate = (newVitals: any) => {
    setVitals(prev => ({
      ...prev,
      heartRate: newVitals.heartRate,
      spO2: newVitals.spO2,
      bloodSugar: newVitals.glucose,
      bloodViscosity: newVitals.viscosity
    }));
  };

  const handleBluetoothData = (data: { hr: number; spo2: number }) => {
    setVitals(prev => ({
      ...prev,
      heartRate: data.hr,
      spO2: data.spo2
    }));
    toast({
      title: "ESP32 Data Received",
      description: `HR: ${data.hr} bpm, SpO₂: ${data.spo2}%`
    });
  };

  const saveVitalsToHistory = () => {
    if (vitals.heartRate || vitals.spO2 || vitals.bloodSugar) {
      const vitalsWithTimestamp = {
        ...vitals,
        timestamp: new Date().toISOString()
      };
      setVitalsHistory(prev => [vitalsWithTimestamp, ...prev]);
      toast({
        title: "Vitals Saved",
        description: "Your health data has been recorded."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-500 mr-2 animate-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Live Health Monitoring
            </h1>
          </div>
          <p className="text-gray-600">Sofowat Health Vitals - Professional Grade Monitoring</p>
        </div>

        {/* Connection Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Bluetooth className="w-5 h-5 mr-2 text-blue-500" />
                ESP32 Bluetooth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BluetoothConnector 
                onDataReceived={handleBluetoothData}
                onConnectionChange={setIsBluetoothConnected}
              />
              <p className={`text-sm mt-2 ${isBluetoothConnected ? 'text-green-600' : 'text-gray-500'}`}>
                {isBluetoothConnected ? '✓ Connected to ESP32' : '○ Not connected'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Camera className="w-5 h-5 mr-2 text-green-500" />
                Camera PPG Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setIsCameraActive(!isCameraActive)}
                className={`w-full ${isCameraActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {isCameraActive ? 'Stop Camera Scan' : 'Start Camera Scan'}
              </Button>
              {isCameraActive && (
                <div className="mt-4">
                  <VideoCapture 
                    onVitalsUpdate={handleVitalsUpdate}
                    onProcessingChange={setIsProcessing}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vitals Display */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Vitals Summary
              </div>
              <Button 
                onClick={saveVitalsToHistory}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Reading
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Heart Rate</p>
                <p className="text-xl font-bold text-red-600">
                  {vitals.heartRate ? `${vitals.heartRate} bpm` : '-- bpm'}
                </p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">SpO₂</p>
                <p className="text-xl font-bold text-blue-600">
                  {vitals.spO2 ? `${vitals.spO2}%` : '--%'}
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Activity className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Blood Pressure</p>
                <p className="text-xl font-bold text-green-600">
                  {vitals.bloodPressure || '-- / -- mmHg'}
                </p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Blood Sugar</p>
                <p className="text-xl font-bold text-yellow-600">
                  {vitals.bloodSugar ? `${vitals.bloodSugar} mg/dL` : '-- mg/dL'}
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Droplets className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Blood Viscosity</p>
                <p className="text-xl font-bold text-purple-600">
                  {vitals.bloodViscosity ? `${vitals.bloodViscosity} mPa·s` : '-- mPa·s'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vitals History */}
        <VitalsHistory vitalsHistory={vitalsHistory} />

        {/* Medical Disclaimer */}
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-medium text-gray-800 mb-3">⚕️ Medical Disclaimer:</p>
              <ul className="space-y-1 ml-4">
                <li>• This device is for monitoring purposes only</li>
                <li>• Not intended for medical diagnosis or treatment</li>
                <li>• Consult healthcare professionals for medical advice</li>
                <li>• Keep data private and secure</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VitalsMonitor;
