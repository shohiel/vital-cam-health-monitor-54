
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalibrationData {
  userGlucose: number;
  userViscosity: number;
  userBloodPressure: string;
  timestamp: string;
}

interface ManualCalibrationProps {
  onCalibrationUpdate: (data: CalibrationData) => void;
}

const ManualCalibration = ({ onCalibrationUpdate }: ManualCalibrationProps) => {
  const [userGlucose, setUserGlucose] = useState<string>('100');
  const [userViscosity, setUserViscosity] = useState<string>('2.0');
  const [userBloodPressure, setUserBloodPressure] = useState<string>('120/80');
  const { toast } = useToast();

  const handleSaveCalibration = () => {
    try {
      const glucoseValue = parseFloat(userGlucose);
      const viscosityValue = parseFloat(userViscosity);
      
      // Validate inputs
      if (isNaN(glucoseValue) || glucoseValue < 50 || glucoseValue > 300) {
        toast({
          title: "Invalid Glucose Value",
          description: "Please enter a value between 50-300 mg/dL",
          variant: "destructive"
        });
        return;
      }

      if (isNaN(viscosityValue) || viscosityValue < 1 || viscosityValue > 5) {
        toast({
          title: "Invalid Viscosity Value", 
          description: "Please enter a value between 1-5 Pa·s",
          variant: "destructive"
        });
        return;
      }

      // Validate blood pressure format
      const bpPattern = /^\d{2,3}\/\d{2,3}$/;
      if (!bpPattern.test(userBloodPressure)) {
        toast({
          title: "Invalid Blood Pressure Format",
          description: "Please use format: systolic/diastolic (e.g., 120/80)",
          variant: "destructive"
        });
        return;
      }

      const calibrationData: CalibrationData = {
        userGlucose: glucoseValue,
        userViscosity: viscosityValue,
        userBloodPressure,
        timestamp: new Date().toISOString()
      };

      onCalibrationUpdate(calibrationData);
      
      toast({
        title: "Calibration Saved",
        description: "Personal calibration data has been updated for more accurate PPG measurements"
      });

    } catch (error) {
      toast({
        title: "Calibration Error",
        description: "Failed to save calibration data",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <Stethoscope className="w-5 h-5 mr-2 text-purple-500" />
          Manual Calibration
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enter your known medical device readings for personalized PPG calibration
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="glucose" className="text-sm font-medium">
            Blood Glucose (mg/dL)
          </Label>
          <Input
            id="glucose"
            type="number"
            value={userGlucose}
            onChange={(e) => setUserGlucose(e.target.value)}
            placeholder="100"
            min="50"
            max="300"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Normal range: 80-120 mg/dL</p>
        </div>
        
        <div>
          <Label htmlFor="viscosity" className="text-sm font-medium">
            Blood Viscosity (Pa·s)
          </Label>
          <Input
            id="viscosity"
            type="number"
            value={userViscosity}
            onChange={(e) => setUserViscosity(e.target.value)}
            placeholder="2.0"
            min="1"
            max="5"
            step="0.1"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Normal range: 1.5-3.5 Pa·s</p>
        </div>

        <div>
          <Label htmlFor="bloodPressure" className="text-sm font-medium">
            Blood Pressure (mmHg)
          </Label>
          <Input
            id="bloodPressure"
            type="text"
            value={userBloodPressure}
            onChange={(e) => setUserBloodPressure(e.target.value)}
            placeholder="120/80"
            pattern="\d{2,3}/\d{2,3}"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Format: systolic/diastolic (e.g., 120/80)</p>
        </div>

        <Button 
          onClick={handleSaveCalibration}
          className="w-full bg-purple-500 hover:bg-purple-600"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Calibration Data
        </Button>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>📊 Calibration Purpose:</strong> This data helps improve PPG measurement accuracy by 
            comparing your known medical device readings with our camera-based estimations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualCalibration;
