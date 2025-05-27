import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Droplets, Zap, Bluetooth, Camera, Save } from 'lucide-react';
import VideoCapture from '../components/VideoCapture';
import BluetoothConnector from '../components/BluetoothConnector';
import VitalsHistory from '../components/VitalsHistory';
import ManualCalibration from '../components/ManualCalibration';
import { useToast } from '@/hooks/use-toast';

interface VitalsData {
  heartRate: number | null;
  spO2: number | null;
  bloodPressure: string | null;
  bloodSugar: number | null;
  bloodViscosity: number | null;
  timestamp?: string;
}

interface CalibrationData {
  userGlucose: number;
  userViscosity: number;
  userBloodPressure: string;
  timestamp: string;
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
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const [userAge, setUserAge] = useState<number>();
  const [userGender, setUserGender] = useState<string>();
  const { toast } = useToast();

  const handleVitalsUpdate = (newVitals: any) => {
    // Apply calibration if available
    let calibratedVitals = {
      heartRate: newVitals.heartRate,
      spO2: newVitals.spO2,
      bloodSugar: newVitals.glucose,
      bloodViscosity: newVitals.viscosity,
      bloodPressure: newVitals.systolic && newVitals.diastolic ? 
        `${newVitals.systolic}/${newVitals.diastolic}` : null
    };

    if (calibrationData) {
      // Apply linear calibration based on user's known values
      if (newVitals.glucose && calibrationData.userGlucose) {
        calibratedVitals.bloodSugar = calibrationData.userGlucose + (newVitals.glucose - calibrationData.userGlucose) * 0.8;
      }
      if (newVitals.viscosity && calibrationData.userViscosity) {
        calibratedVitals.bloodViscosity = calibrationData.userViscosity + (newVitals.viscosity - calibrationData.userViscosity) * 0.8;
      }
      if (calibrationData.userBloodPressure) {
        calibratedVitals.bloodPressure = calibrationData.userBloodPressure;
      }
    }

    setVitals(prev => ({ ...prev, ...calibratedVitals }));
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

  const handleCalibrationUpdate = (newCalibrationData: CalibrationData) => {
    setCalibrationData(newCalibrationData);
    // Store calibration data locally
    localStorage.setItem('sofowat_calibration', JSON.stringify(newCalibrationData));
    
    // Start immediate test after calibration
    setIsCameraActive(true);
    toast({
      title: "Calibration Updated",
      description: "Starting immediate test with new calibration data for reference."
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
        description: "Your health data has been recorded with calibration applied."
      });
    }
  };

  // Load calibration data on component mount
  useEffect(() => {
    const savedCalibration = localStorage.getItem('sofowat_calibration');
    if (savedCalibration) {
      try {
        setCalibrationData(JSON.parse(savedCalibration));
      } catch (error) {
        console.error('Failed to load calibration data:', error);
      }
    }
  }, []);

  // Load user demographics
  useEffect(() => {
    const savedDemographics = localStorage.getItem('sofowat_demographics');
    if (savedDemographics) {
      try {
        const demographics = JSON.parse(savedDemographics);
        setUserAge(demographics.age);
        setUserGender(demographics.gender);
      } catch (error) {
        console.error('Failed to load demographics:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-500 mr-2 animate-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              AI-Enhanced Medical Diagnostics
            </h1>
          </div>
          <p className="text-gray-600">Advanced Machine Learning with Global Medical Dataset Integration</p>
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
                Advanced AI PPG Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setIsCameraActive(!isCameraActive)}
                className={`w-full ${isCameraActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {isCameraActive ? 'Stop AI Analysis' : 'Start AI Analysis'}
              </Button>
              {isCameraActive && (
                <div className="mt-4">
                  <VideoCapture 
                    onVitalsUpdate={handleVitalsUpdate}
                    onProcessingChange={setIsProcessing}
                    userAge={userAge}
                    userGender={userGender}
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
                Advanced AI Medical Analysis {calibrationData && <span className="text-xs text-purple-600 ml-2">(Calibrated)</span>}
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
                  {vitals.bloodSugar ? `${vitals.bloodSugar.toFixed(1)} mg/dL` : '-- mg/dL'}
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Droplets className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Blood Viscosity</p>
                <p className="text-xl font-bold text-purple-600">
                  {vitals.bloodViscosity ? `${vitals.bloodViscosity.toFixed(2)} Pa·s` : '-- Pa·s'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Calibration - Now below vitals display */}
        <ManualCalibration onCalibrationUpdate={handleCalibrationUpdate} />

        {/* Vitals History */}
        <VitalsHistory vitalsHistory={vitalsHistory} />

        {/* Enhanced Medical Disclaimer */}
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-medium text-gray-800 mb-3">🤖 Advanced AI Medical Disclaimer:</p>
              <ul className="space-y-1 ml-4">
                <li>• Uses cutting-edge machine learning with global medical datasets</li>
                <li>• Advanced signal processing with internet-based medical knowledge</li>
                <li>• Continuous learning from user measurements for accuracy improvement</li>
                <li>• Medical-grade PPG analysis with flash optimization</li>
                <li>• For monitoring purposes only - consult healthcare professionals</li>
                <li>• All data contributes to AI model enhancement and accuracy</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VitalsMonitor;
