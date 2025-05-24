
export function processSignal(redValues: number[]): {
  heartRate: number;
  spO2: number;
  glucose: number;
  viscosity: number;
} {
  // Apply moving average filter to smooth the signal
  const smoothedValues = movingAverage(redValues, 5);
  
  // Calculate heart rate using peak detection
  const heartRate = calculateHeartRate(smoothedValues);
  
  // Calculate other vitals based on signal characteristics
  const amplitude = Math.max(...smoothedValues) - Math.min(...smoothedValues);
  const variance = calculateVariance(smoothedValues);
  const signalMean = smoothedValues.reduce((sum, val) => sum + val, 0) / smoothedValues.length;
  
  // Simulated calculations (in a real app, these would use validated algorithms)
  const spO2 = Math.min(100, Math.max(85, 98 - (amplitude / signalMean) * 10 + Math.random() * 2));
  const glucose = Math.max(70, Math.min(140, 90 + (variance / 1000) * 20 + Math.random() * 10));
  const viscosity = Math.max(1, Math.min(5, 2.5 + (amplitude / signalMean) * 0.5 + Math.random() * 0.3));
  
  return {
    heartRate: Math.round(heartRate),
    spO2: Math.round(spO2 * 10) / 10,
    glucose: Math.round(glucose * 10) / 10,
    viscosity: Math.round(viscosity * 100) / 100
  };
}

function movingAverage(data: number[], windowSize: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length - 1, i + Math.floor(windowSize / 2));
    
    let sum = 0;
    let count = 0;
    
    for (let j = start; j <= end; j++) {
      sum += data[j];
      count++;
    }
    
    result.push(sum / count);
  }
  
  return result;
}

function calculateHeartRate(smoothedValues: number[]): number {
  if (smoothedValues.length < 30) return 0;
  
  // Simple peak detection for heart rate calculation
  const peaks = findPeaks(smoothedValues);
  
  if (peaks.length < 2) return 60; // Default if no peaks found
  
  // Calculate average time between peaks
  const peakIntervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) {
    peakIntervals.push(peaks[i] - peaks[i - 1]);
  }
  
  if (peakIntervals.length === 0) return 60;
  
  const avgInterval = peakIntervals.reduce((sum, interval) => sum + interval, 0) / peakIntervals.length;
  
  // Convert to BPM (assuming 10 FPS sampling rate)
  const bpm = (60 * 10) / avgInterval;
  
  // Clamp to reasonable range
  return Math.max(40, Math.min(180, bpm));
}

function findPeaks(data: number[]): number[] {
  const peaks: number[] = [];
  const threshold = calculateThreshold(data);
  
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] > threshold) {
      // Ensure peaks are at least 5 samples apart (0.5 seconds at 10 FPS)
      if (peaks.length === 0 || i - peaks[peaks.length - 1] >= 5) {
        peaks.push(i);
      }
    }
  }
  
  return peaks;
}

function calculateThreshold(data: number[]): number {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = calculateVariance(data);
  const stdDev = Math.sqrt(variance);
  
  return mean + stdDev * 0.5; // Adaptive threshold
}

function calculateVariance(data: number[]): number {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
}
