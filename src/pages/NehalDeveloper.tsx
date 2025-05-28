
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  Heart, 
  Brain, 
  Database, 
  Zap, 
  Award, 
  Code, 
  Stethoscope,
  Users,
  TrendingUp,
  Shield,
  Cpu,
  Activity
} from 'lucide-react';

const NehalDeveloper = () => {
  const technologies = [
    'AI/ML Healthcare Systems',
    'Clinical Data Analysis',
    'Reinforcement Learning',
    'Computer Vision (PPG)',
    'Medical Device Software',
    'React & TypeScript',
    'TensorFlow & PyTorch',
    'Medical Signal Processing',
    'Clinical Standards (ISO 27799)',
    'Real-time Data Processing',
    'Healthcare APIs',
    'Diagnostic Algorithms'
  ];

  const projects = [
    {
      title: 'Nehal Health - Clinical AI Diagnostics',
      description: 'Advanced medical AI system with reinforcement learning for non-invasive health monitoring',
      features: ['PPG-based vitals monitoring', 'Multi-dataset AI validation', 'Clinical-grade accuracy', 'Real-time analysis'],
      accuracy: '97%',
      icon: Heart
    },
    {
      title: 'Medical Dataset Integration Platform',
      description: 'Large-scale integration of Kaggle and clinical datasets for enhanced AI model training',
      features: ['Multi-source data fusion', 'Pattern recognition', 'Automated calibration', 'Precision medicine'],
      accuracy: '95%',
      icon: Database
    },
    {
      title: 'Reinforcement Learning Health Engine',
      description: 'Self-improving AI system that learns from patient data to enhance diagnostic accuracy',
      features: ['Continuous learning', 'Adaptive algorithms', 'Clinical feedback loops', 'Personalized medicine'],
      accuracy: '96%',
      icon: Brain
    }
  ];

  const achievements = [
    { title: 'Clinical AI Specialist', description: 'Expert in medical AI systems and diagnostic algorithms' },
    { title: 'Healthcare Innovation', description: 'Pioneering non-invasive diagnostic technologies' },
    { title: 'Data Science Excellence', description: 'Advanced expertise in medical data analysis and ML' },
    { title: 'Regulatory Compliance', description: 'ISO 27799:2016 and clinical standards implementation' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center py-8">
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-4xl font-bold text-white">NK</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Nehal Kader
          </h1>
          <p className="text-xl text-gray-600 mb-4">Medical AI & Clinical Systems Developer</p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Specializing in advanced healthcare AI, clinical diagnostics, and precision medicine technologies
          </p>
          
          <div className="flex justify-center space-x-4 mt-6">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Phone className="w-4 h-4 mr-2" />
              01844691500
            </Button>
            <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
              <Mail className="w-4 h-4 mr-2" />
              Contact Developer
            </Button>
          </div>
        </div>

        {/* Expertise Section */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Brain className="w-6 h-6 mr-3 text-purple-500" />
              Core Expertise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technologies.map((tech, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="p-3 text-center bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Featured Projects */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Code className="w-6 h-6 mr-3 text-blue-500" />
              Featured Healthcare AI Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <project.icon className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <h3 className="font-bold text-lg">{project.title}</h3>
                      <Badge className="bg-green-500 text-white text-xs">{project.accuracy} Accuracy</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="space-y-2">
                    {project.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical Achievements */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Award className="w-5 h-5 mr-3 text-yellow-500" />
                Professional Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                    <p className="text-gray-600 text-sm">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <TrendingUp className="w-5 h-5 mr-3 text-green-500" />
                Impact & Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">97%</div>
                  <div className="text-sm text-gray-600">Clinical Accuracy</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">15+</div>
                  <div className="text-sm text-gray-600">AI Models Deployed</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">50K+</div>
                  <div className="text-sm text-gray-600">Data Points Processed</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">5+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Specifications */}
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-green-50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Stethoscope className="w-5 h-5 mr-3 text-red-500" />
              Nehal Health System Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center">
                  <Cpu className="w-4 h-4 mr-2 text-blue-500" />
                  AI Architecture
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Multi-layer neural networks</li>
                  <li>• Reinforcement learning algorithms</li>
                  <li>• Real-time signal processing</li>
                  <li>• Adaptive threshold optimization</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-green-500" />
                  Clinical Features
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PPG-based vital sign monitoring</li>
                  <li>• Blood glucose estimation (mmol/L)</li>
                  <li>• Multi-wavelength analysis</li>
                  <li>• Automatic camera control</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-purple-500" />
                  Compliance & Standards
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ISO 27799:2016 compliant</li>
                  <li>• Clinical-grade data security</li>
                  <li>• HIPAA considerations</li>
                  <li>• Medical device standards</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-0 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-xl">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">Get in Touch</h3>
            <p className="mb-6 opacity-90">
              Interested in advanced healthcare AI solutions or collaboration opportunities?
            </p>
            <div className="flex justify-center space-x-6">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                <span className="font-semibold">01844691500</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                <span>Medical AI Specialist</span>
              </div>
            </div>
            <p className="text-sm opacity-75 mt-4">
              Available for consultation on healthcare AI projects and medical diagnostic systems
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">
            © 2024 Nehal Kader - Advanced Healthcare AI & Clinical Systems Developer
          </p>
          <p className="text-xs mt-2">
            Specialized in precision medicine, diagnostic AI, and clinical-grade health monitoring systems
          </p>
        </div>
      </div>
    </div>
  );
};

export default NehalDeveloper;
