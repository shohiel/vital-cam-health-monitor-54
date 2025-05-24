
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Droplets, Activity, Zap, Gauge } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VitalsDisplayProps {
  vitals: {
    heartRate: number | null;
    spO2: number | null;
    glucose: number | null;
    viscosity: number | null;
    bloodPressure: string | null;
  };
  isProcessing: boolean;
}

const VitalsDisplay = ({ vitals, isProcessing }: VitalsDisplayProps) => {
  const getHeartRateColor = (hr: number | null) => {
    if (!hr) return 'text-gray-400';
    if (hr < 60) return 'text-blue-500';
    if (hr <= 100) return 'text-green-500';
    return 'text-red-500';
  };

  const getSpO2Color = (spo2: number | null) => {
    if (!spo2) return 'text-gray-400';
    if (spo2 >= 95) return 'text-green-500';
    if (spo2 >= 90) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBPColor = (bp: string | null) => {
    if (!bp) return 'text-gray-400';
    const [systolic] = bp.split('/').map(Number);
    if (systolic < 120) return 'text-green-500';
    if (systolic < 140) return 'text-yellow-500';
    return 'text-red-500';
  };

  const vitalsConfig = [
    {
      key: 'heartRate',
      title: 'Heart Rate',
      icon: Heart,
      value: vitals.heartRate,
      unit: 'bpm',
      color: getHeartRateColor(vitals.heartRate),
      range: [40, 120],
      normalRange: [60, 100]
    },
    {
      key: 'spO2',
      title: 'Blood Oxygen',
      icon: Droplets,
      value: vitals.spO2,
      unit: '%',
      color: getSpO2Color(vitals.spO2),
      range: [80, 100],
      normalRange: [95, 100]
    },
    {
      key: 'bloodPressure',
      title: 'Blood Pressure',
      icon: Gauge,
      value: vitals.bloodPressure,
      unit: 'mmHg',
      color: getBPColor(vitals.bloodPressure),
      displayValue: vitals.bloodPressure || '--/--',
      showProgress: false
    },
    {
      key: 'glucose',
      title: 'Blood Glucose',
      icon: Activity,
      value: vitals.glucose,
      unit: 'mg/dL',
      color: vitals.glucose ? 'text-purple-500' : 'text-gray-400',
      range: [70, 140],
      normalRange: [80, 120]
    },
    {
      key: 'viscosity',
      title: 'Blood Viscosity',
      icon: Zap,
      value: vitals.viscosity,
      unit: 'cP',
      color: vitals.viscosity ? 'text-indigo-500' : 'text-gray-400',
      range: [1, 5],
      normalRange: [1.5, 3.5]
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {vitalsConfig.map((vital) => (
        <Card key={vital.key} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center">
                <vital.icon className={`w-5 h-5 mr-2 ${vital.color}`} />
                {vital.title}
              </div>
              {isProcessing && !vital.value && (
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold ${vital.color}`}>
                {vital.displayValue || (vital.value ? vital.value.toFixed(1) : '--')}
              </span>
              <span className="text-sm text-gray-500">{vital.unit}</span>
            </div>
            
            {vital.value && vital.showProgress !== false && vital.range && (
              <div className="space-y-1">
                <Progress 
                  value={((vital.value - vital.range[0]) / (vital.range[1] - vital.range[0])) * 100}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{vital.range[0]}</span>
                  <span className="text-green-600 font-medium">
                    Normal: {vital.normalRange[0]}-{vital.normalRange[1]}
                  </span>
                  <span>{vital.range[1]}</span>
                </div>
              </div>
            )}
            
            {vital.key === 'bloodPressure' && vital.value && (
              <div className="text-xs text-gray-500 mt-1">
                Normal: &lt;120/80 mmHg
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VitalsDisplay;
