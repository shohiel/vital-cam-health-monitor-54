import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Waves, Filter } from 'lucide-react';

interface WaveformVisualizationProps {
  redValues: number[];
  greenValues: number[];
  blueValues: number[];
  sampleRate?: number;
}

const WaveformVisualization: React.FC<WaveformVisualizationProps> = ({
  redValues,
  greenValues,
  blueValues,
  sampleRate = 60
}) => {
  // Process data for visualization - show last 150 samples (2.5 seconds at 60fps)
  const displaySamples = 150;
  
  const ppgData = useMemo(() => {
    const recentRed = redValues.slice(-displaySamples);
    const recentGreen = greenValues.slice(-displaySamples);
    
    return recentRed.map((r, i) => {
      // PPG signal is primarily from red channel, with green for noise reference
      const ppgRaw = r;
      const greenRef = recentGreen[i] || 0;
      
      // Simple high-pass filter simulation (remove DC component)
      const avgRed = recentRed.reduce((a, b) => a + b, 0) / recentRed.length;
      const ppgFiltered = r - avgRed;
      
      return {
        time: i,
        raw: ppgRaw,
        green: greenRef,
        filtered: ppgFiltered + 128, // Offset for visualization
        ac: Math.abs(ppgFiltered) // AC component magnitude
      };
    });
  }, [redValues, greenValues]);

  // Calculate FFT for spectral analysis
  const spectralData = useMemo(() => {
    if (redValues.length < 64) return [];
    
    const samples = redValues.slice(-128);
    const n = samples.length;
    
    // Remove DC and normalize
    const mean = samples.reduce((a, b) => a + b, 0) / n;
    const normalized = samples.map(s => s - mean);
    
    // Simple DFT for visualization (showing magnitude spectrum)
    const spectrum: { freq: number; magnitude: number; phase: number }[] = [];
    const maxFreq = Math.min(32, Math.floor(n / 2)); // Up to ~16Hz at 60fps
    
    for (let k = 1; k < maxFreq; k++) {
      let real = 0;
      let imag = 0;
      
      for (let t = 0; t < n; t++) {
        const angle = (2 * Math.PI * k * t) / n;
        real += normalized[t] * Math.cos(angle);
        imag -= normalized[t] * Math.sin(angle);
      }
      
      const magnitude = Math.sqrt(real * real + imag * imag) / n;
      const freqHz = (k * sampleRate) / n;
      
      // Only show frequencies in physiological range (0.5-4 Hz for HR)
      if (freqHz >= 0.5 && freqHz <= 4) {
        spectrum.push({
          freq: parseFloat(freqHz.toFixed(2)),
          magnitude: magnitude * 100,
          phase: Math.atan2(imag, real)
        });
      }
    }
    
    return spectrum;
  }, [redValues, sampleRate]);

  // Find dominant frequency (heart rate)
  const dominantFreq = useMemo(() => {
    if (spectralData.length === 0) return null;
    const maxMag = Math.max(...spectralData.map(s => s.magnitude));
    const dominant = spectralData.find(s => s.magnitude === maxMag);
    return dominant ? { freq: dominant.freq, bpm: Math.round(dominant.freq * 60) } : null;
  }, [spectralData]);

  // Filtered signal data (bandpass 0.5-4 Hz simulated)
  const filteredData = useMemo(() => {
    if (redValues.length < 30) return [];
    
    const samples = redValues.slice(-displaySamples);
    const windowSize = 5;
    
    return samples.map((_, i) => {
      // Moving average for smoothing
      const start = Math.max(0, i - windowSize);
      const end = Math.min(samples.length, i + windowSize + 1);
      const window = samples.slice(start, end);
      const smoothed = window.reduce((a, b) => a + b, 0) / window.length;
      
      // Remove baseline wander (high-pass)
      const baselineWindow = 30;
      const baselineStart = Math.max(0, i - baselineWindow);
      const baselineEnd = Math.min(samples.length, i + baselineWindow + 1);
      const baseline = samples.slice(baselineStart, baselineEnd).reduce((a, b) => a + b, 0) / (baselineEnd - baselineStart);
      
      const filtered = smoothed - baseline;
      
      return {
        time: i,
        filtered: filtered + 128,
        envelope: Math.abs(filtered) + 128,
        baseline: baseline
      };
    });
  }, [redValues]);

  if (redValues.length < 10) {
    return (
      <Card className="border-0 bg-gray-900/95 text-white">
        <CardContent className="p-4 text-center text-gray-400">
          <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
          <p>Waiting for signal data...</p>
          <p className="text-xs mt-1">Place finger over camera</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Raw PPG Signal */}
      <Card className="border-0 bg-gray-900/95 text-white overflow-hidden">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-4 h-4 mr-2 text-red-400" />
              Raw PPG Signal
            </div>
            <span className="text-xs text-gray-400">{redValues.length} samples</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ppgData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <Line 
                type="monotone" 
                dataKey="raw" 
                stroke="#ef4444" 
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="green" 
                stroke="#22c55e" 
                strokeWidth={1}
                dot={false}
                opacity={0.5}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Spectral Analysis */}
      <Card className="border-0 bg-gray-900/95 text-white overflow-hidden">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center">
              <Waves className="w-4 h-4 mr-2 text-blue-400" />
              Spectral Analysis (FFT)
            </div>
            {dominantFreq && (
              <span className="text-xs bg-blue-500/30 px-2 py-0.5 rounded text-blue-300">
                Peak: {dominantFreq.freq}Hz ({dominantFreq.bpm} BPM)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spectralData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="spectralGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="freq" 
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
              />
              <Area 
                type="monotone" 
                dataKey="magnitude" 
                stroke="#3b82f6" 
                fill="url(#spectralGradient)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filtered Signal */}
      <Card className="border-0 bg-gray-900/95 text-white overflow-hidden">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2 text-green-400" />
              Filtered PPG (Bandpass)
            </div>
            <span className="text-xs text-gray-400">0.5-4 Hz</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="envelopeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="envelope" 
                stroke="none"
                fill="url(#envelopeGradient)"
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="filtered" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Signal Quality Indicators */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-gray-800/80 rounded p-2 text-center">
          <div className="text-gray-400">Signal Strength</div>
          <div className="text-lg font-bold text-red-400">
            {ppgData.length > 0 ? Math.round(ppgData[ppgData.length - 1]?.raw || 0) : '--'}
          </div>
        </div>
        <div className="bg-gray-800/80 rounded p-2 text-center">
          <div className="text-gray-400">AC Amplitude</div>
          <div className="text-lg font-bold text-blue-400">
            {ppgData.length > 0 ? Math.round(Math.max(...ppgData.map(p => p.ac))) : '--'}
          </div>
        </div>
        <div className="bg-gray-800/80 rounded p-2 text-center">
          <div className="text-gray-400">Est. HR</div>
          <div className="text-lg font-bold text-green-400">
            {dominantFreq ? `${dominantFreq.bpm}` : '--'}
            <span className="text-xs font-normal"> bpm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveformVisualization;
