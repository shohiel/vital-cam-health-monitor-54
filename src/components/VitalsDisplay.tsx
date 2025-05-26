
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Droplets, Activity, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VitalsDisplayProps {
  vitals: {
    heartRate: number | null;
    spO2: number | null;
    glucose: number | null;
    viscosity: number | null;
    systolic: number | null;
    diastolic: number | null;
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

  const getBPColor = (systolic: number | null, diastolic: number | null) => {
    if (!systolic || !diastolic) return 'text-gray-400';
    if (systolic < 120 && diastolic < 80) return 'text-green-500';
    if (systolic < 140 && diastolic < 90) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGlucoseColor = (glucose: number | null) => {
    if (!glucose) return 'text-gray-400';
    if (glucose >= 80 && glucose <= 120) return 'text-green-500';
    if (glucose >= 70 && glucose <= 140) return 'text-yellow-500';
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
      range: [40, 120] as [number, number],
      normalRange: [60, 100] as [number, number]
    },
    {
      key: 'spO2',
      title: 'Blood Oxygen',
      icon: Droplets,
      value: vitals.spO2,
      unit: '%',
      color: getSpO2Color(vitals.spO2),
      range: [80, 100] as [number, number],
      normalRange: [95, 100] as [number, number]
    },
    {
      key: 'bloodPressure',
      title: 'Blood Pressure',
      icon: Activity,
      value: vitals.systolic && vitals.diastolic ? `${vitals.systolic}/${vitals.diastolic}` : null,
      unit: 'mmHg',
      color: getBPColor(vitals.systolic, vitals.diastolic),
      range: [80, 180] as [number, number],
      normalRange: [90, 140] as [number, number],
      displayValue: vitals.systolic && vitals.diastolic ? vitals.systolic : null,
      subtitle: vitals.systolic && vitals.diastolic ? 'Dataset-based estimation' : null
    },
    {
      key: 'glucose',
      title: 'Blood Glucose',
      icon: Activity,
      value: vitals.glucose,
      unit: 'mg/dL',
      color: getGlucoseColor(vitals.glucose),
      range: [70, 200] as [number, number],
      normalRange: [80, 120] as [number, number]
    },
    {
      key: 'viscosity',
      title: 'Blood Viscosity',
      icon: Zap,
      value: vitals.viscosity,
      unit: 'cP',
      color: vitals.viscosity ? 'text-indigo-500' : 'text-gray-400',
      range: [1, 8] as [number, number],
      normalRange: [1.5, 4.5] as [number, number]
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
                <div>
                  {vital.title}
                  {vital.subtitle && (
                    <div className="text-xs text-gray-500 font-normal">{vital.subtitle}</div>
                  )}
                </div>
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
                {vital.key === 'bloodPressure' 
                  ? (vital.value || '--/--')
                  : vital.value 
                    ? (typeof vital.value === 'number' ? vital.value.toFixed(1) : vital.value)
                    : '--'
                }
              </span>
              <span className="text-sm text-gray-500">{vital.unit}</span>
            </div>
            
            {(vital.displayValue !== undefined ? vital.displayValue : vital.value) && (
              <div className="space-y-1">
                <Progress 
                  value={((typeof vital.value === 'number' ? vital.value : vital.displayValue || 0) - vital.range[0]) / (vital.range[1] - vital.range[0]) * 100}
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
          </CardContent>
        </Card>
      ))}
      
      {isProcessing && (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-blue-600 font-medium">📊 Processing with dataset analysis...</div>
          <div className="text-sm text-blue-500 mt-1">Enhanced accuracy with flash measurement</div>
        </div>
      )}
    </div>
  );
};

export default VitalsDisplay;
