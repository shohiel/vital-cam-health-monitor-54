
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VitalsData {
  heartRate: number | null;
  spO2: number | null;
  bloodPressure: string | null;
  bloodSugar: number | null;
  bloodViscosity: number | null;
  timestamp?: string;
}

interface VitalsHistoryProps {
  vitalsHistory: VitalsData[];
}

const VitalsHistory = ({ vitalsHistory }: VitalsHistoryProps) => {
  const exportToCsv = () => {
    const headers = ['Timestamp', 'Heart Rate', 'SpO2', 'Blood Pressure', 'Blood Sugar', 'Blood Viscosity'];
    const csvContent = [
      headers.join(','),
      ...vitalsHistory.map(vital => [
        vital.timestamp ? new Date(vital.timestamp).toLocaleString() : '',
        vital.heartRate || '',
        vital.spO2 || '',
        vital.bloodPressure || '',
        vital.bloodSugar || '',
        vital.bloodViscosity || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sofowat-vitals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <History className="w-5 h-5 mr-2 text-gray-500" />
            Vitals History ({vitalsHistory.length} records)
          </div>
          {vitalsHistory.length > 0 && (
            <Button 
              onClick={exportToCsv}
              size="sm"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vitalsHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No vitals recorded yet. Take your first measurement!</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {vitalsHistory.map((vital, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-600">
                    {vital.timestamp ? new Date(vital.timestamp).toLocaleString() : 'Unknown time'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">HR:</span>
                    <span className="ml-1 font-medium text-red-600">
                      {vital.heartRate ? `${vital.heartRate} bpm` : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">SpO₂:</span>
                    <span className="ml-1 font-medium text-blue-600">
                      {vital.spO2 ? `${vital.spO2}%` : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">BP:</span>
                    <span className="ml-1 font-medium text-green-600">
                      {vital.bloodPressure || '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">BG:</span>
                    <span className="ml-1 font-medium text-yellow-600">
                      {vital.bloodSugar ? `${vital.bloodSugar} mg/dL` : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">BV:</span>
                    <span className="ml-1 font-medium text-purple-600">
                      {vital.bloodViscosity ? `${vital.bloodViscosity} mPa·s` : '--'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VitalsHistory;
