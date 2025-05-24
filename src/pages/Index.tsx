
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Monitor, History, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthGuard from '../components/AuthGuard';

const Index = () => {
  const navigate = useNavigate();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center py-6">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-red-500 mr-3 animate-pulse" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Sofowat Health Vitals
              </h1>
            </div>
            <p className="text-gray-600 text-lg">Professional Grade Health Monitoring System</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate('/vitals-monitor')}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Monitor className="w-6 h-6 mr-3 text-blue-500" />
                  Live Vitals Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Start real-time health monitoring using camera PPG analysis and ESP32 sensors
                </p>
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Start Monitoring
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Activity className="w-6 h-6 mr-3 text-green-500" />
                  Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Measurement:</span>
                    <span className="font-medium">Today, 2:30 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heart Rate:</span>
                    <span className="font-medium text-red-600">72 bpm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SpO₂:</span>
                    <span className="font-medium text-blue-600">98%</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View Full History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Heart Rate & SpO₂</h3>
                <p className="text-gray-600 text-sm">
                  Real-time cardiovascular monitoring with pulse oximetry
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6 text-center">
                <Activity className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Blood Pressure</h3>
                <p className="text-gray-600 text-sm">
                  Non-invasive blood pressure estimation using PPG technology
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6 text-center">
                <History className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Health Analytics</h3>
                <p className="text-gray-600 text-sm">
                  Advanced blood glucose and viscosity analysis
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Medical Information */}
          <Card className="border-0 bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium text-gray-800 mb-3">🏥 Medical Grade Features:</p>
                <ul className="space-y-1 ml-4 grid md:grid-cols-2 gap-1">
                  <li>• ESP32 Bluetooth sensor integration</li>
                  <li>• Camera-based photoplethysmography</li>
                  <li>• Machine learning health analysis</li>
                  <li>• Secure data logging and export</li>
                  <li>• Real-time vital signs monitoring</li>
                  <li>• HIPAA-compliant data handling</li>
                </ul>
                <p className="text-xs text-gray-500 mt-4">
                  * This system is designed for monitoring and research purposes. Always consult healthcare professionals for medical decisions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Index;
