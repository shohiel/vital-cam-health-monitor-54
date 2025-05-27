
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Code, Heart, Globe } from 'lucide-react';

const Developer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-blue-500 mr-2" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Developer Information
            </h1>
          </div>
          <p className="text-gray-600">Meet the creator of this advanced medical diagnostics system</p>
        </div>

        {/* Developer Profile Card */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-2xl">
              <Code className="w-6 h-6 mr-3 text-blue-500" />
              Sofowat Kader
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <Mail className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <p className="text-green-600">sofowat2@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">WhatsApp</p>
                    <p className="text-blue-600">+880 1867944820</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                  <User className="w-5 h-5 text-purple-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Institute</p>
                    <p className="text-purple-600">Bangladesh Air Force</p>
                    <p className="text-purple-600">Shaheen College Chattogram</p>
                  </div>
                </div>
              </div>
            </div>

            {/* About the Project */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Heart className="w-5 h-5 text-red-500 mr-2" />
                About This Project
              </h3>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  This advanced medical diagnostics system utilizes cutting-edge machine learning algorithms 
                  and Kaggle medical datasets to provide accurate health monitoring through photoplethysmography (PPG) 
                  analysis. The system combines camera-based vital sign detection with ESP32 Bluetooth integration 
                  for comprehensive health monitoring.
                </p>
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Key Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Heart Rate Monitoring</li>
                      <li>• Blood Oxygen Saturation (SpO₂)</li>
                      <li>• Blood Pressure Estimation</li>
                      <li>• Blood Glucose Monitoring</li>
                      <li>• Blood Viscosity Analysis</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Technologies Used:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• React & TypeScript</li>
                      <li>• Machine Learning & AI</li>
                      <li>• Kaggle Medical Datasets</li>
                      <li>• ESP32 Bluetooth Integration</li>
                      <li>• Advanced Signal Processing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Disclaimer */}
        <Card className="border-0 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-medium text-gray-800 mb-3">⚕️ Medical Disclaimer:</p>
              <p>
                This system is developed for educational and research purposes. While it uses advanced 
                machine learning algorithms and medical datasets, it should not replace professional 
                medical advice, diagnosis, or treatment. Always consult with qualified healthcare 
                professionals for medical decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Developer;
