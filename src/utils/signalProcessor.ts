
// Basic Signal Processing for PPG Analysis
export function processSignal(redValues: number[]): {
  heartRate: number;
  spO2: number;
  confidence: number;
} {
  if (redValues.length < 60) {
    return { heartRate: 0, spO2: 0, confidence: 0 };
  }

  // Simple peak detection for heart rate
  const peaks = findPeaks(redValues);
  const heartRate = calculateHeartRate(peaks);
  const spO2 = estimateSpO2(redValues);
  const confidence = Math.min(95, redValues.length / 3);

  return {
    heartRate: Math.round(heartRate),
    spO2: Math.round(spO2),
    confidence: Math.round(confidence)
  };
}

function findPeaks(signal: number[]): number[] {
  const peaks = [];
  const threshold = calculateThreshold(signal);
  
  for (let i = 1; i < signal.length - 1; i++) {
    if (signal[i] > signal[i-1] && signal[i] > signal[i+1] && signal[i] > threshold) {
      peaks.push(i);
    }
  }
  
  return peaks;
}

function calculateThreshold(signal: number[]): number {
  const max = Math.max(...signal);
  const min = Math.min(...signal);
  return min + (max - min) * 0.6;
}

function calculateHeartRate(peaks: number[]): number {
  if (peaks.length < 2) return 70;
  
  const intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i-1]);
  }
  
  const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  return Math.max(50, Math.min(180, (60 * 60) / avgInterval));
}

function estimateSpO2(signal: number[]): number {
  const amplitude = Math.max(...signal) - Math.min(...signal);
  return Math.max(88, Math.min(100, 95 + amplitude * 0.01));
}
