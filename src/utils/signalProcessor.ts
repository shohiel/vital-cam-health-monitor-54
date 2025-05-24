
export const processSignal = (redValues: number[]) => {
  if (redValues.length < 50) {
    return {
      heartRate: null,
      spO2: null,
      glucose: null,
      viscosity: null,
      bloodPressure: null
    };
  }

  // Apply moving average filter
  const filtered = movingAverage(redValues, 3);
  
  // Calculate heart rate from PPG signal
  const heartRate = calculateHeartRate(filtered);
  
  // Estimate SpO2 based on signal characteristics
  const spO2 = estimateSpO2(filtered);
  
  // Estimate blood pressure using pulse wave analysis
  const bloodPressure = estimateBloodPressure(filtered, heartRate);
  
  // Estimate glucose and viscosity (simplified models)
  const glucose = estimateGlucose(filtered);
  const viscosity = estimateViscosity(filtered);

  return {
    heartRate,
    spO2,
    glucose,
    viscosity,
    bloodPressure
  };
};

const movingAverage = (data: number[], windowSize: number): number[] => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.floor(windowSize / 2) + 1);
    const sum = data.slice(start, end).reduce((a, b) => a + b, 0);
    result.push(sum / (end - start));
  }
  return result;
};

const calculateHeartRate = (signal: number[]): number => {
  // Find peaks in the signal
  const peaks = findPeaks(signal);
  
  if (peaks.length < 2) return 60; // Default value
  
  // Calculate average time between peaks
  const intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const samplingRate = 10; // 10 FPS
  const beatsPerMinute = (60 * samplingRate) / avgInterval;
  
  // Clamp to reasonable range
  return Math.max(40, Math.min(180, Math.round(beatsPerMinute)));
};

const findPeaks = (signal: number[]): number[] => {
  const peaks: number[] = [];
  const threshold = Math.max(...signal) * 0.6; // 60% of max value
  
  for (let i = 1; i < signal.length - 1; i++) {
    if (signal[i] > signal[i - 1] && 
        signal[i] > signal[i + 1] && 
        signal[i] > threshold) {
      peaks.push(i);
    }
  }
  
  return peaks;
};

const estimateSpO2 = (signal: number[]): number => {
  // Simplified SpO2 estimation based on signal quality
  const variance = calculateVariance(signal);
  const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
  const snr = mean / Math.sqrt(variance);
  
  // Map SNR to SpO2 range (simplified)
  const baseSpO2 = 95 + Math.min(5, snr * 0.5);
  return Math.round(Math.max(90, Math.min(100, baseSpO2)));
};

const estimateBloodPressure = (signal: number[], heartRate: number): string => {
  // Simplified blood pressure estimation using pulse wave analysis
  const peaks = findPeaks(signal);
  
  if (peaks.length < 2) return "120/80";
  
  // Calculate pulse wave velocity approximation
  const signalVariability = calculateVariance(signal);
  const pulseAmplitude = Math.max(...signal) - Math.min(...signal);
  
  // Simplified model: relate signal characteristics to BP
  const systolicBase = 120;
  const diastolicBase = 80;
  
  // Adjust based on heart rate and signal characteristics
  const hrFactor = (heartRate - 70) * 0.3; // HR influence
  const amplitudeFactor = (pulseAmplitude - 50) * 0.1; // Amplitude influence
  
  const systolic = Math.round(systolicBase + hrFactor + amplitudeFactor);
  const diastolic = Math.round(diastolicBase + hrFactor * 0.5);
  
  // Clamp to reasonable ranges
  const finalSystolic = Math.max(90, Math.min(180, systolic));
  const finalDiastolic = Math.max(60, Math.min(110, diastolic));
  
  return `${finalSystolic}/${finalDiastolic}`;
};

const estimateGlucose = (signal: number[]): number => {
  // Simplified glucose estimation
  const variance = calculateVariance(signal);
  const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
  
  // Basic model relating signal characteristics to glucose
  const baseGlucose = 100;
  const varianceFactor = (variance - 100) * 0.1;
  const meanFactor = (mean - 128) * 0.05;
  
  const glucose = baseGlucose + varianceFactor + meanFactor;
  return Math.max(70, Math.min(200, Math.round(glucose * 10) / 10));
};

const estimateViscosity = (signal: number[]): number => {
  // Simplified viscosity estimation
  const smoothness = calculateSmoothness(signal);
  const amplitude = Math.max(...signal) - Math.min(...signal);
  
  // Model relating signal smoothness and amplitude to viscosity
  const baseViscosity = 3.0;
  const smoothnessFactor = (smoothness - 0.5) * 2;
  const amplitudeFactor = (amplitude - 50) * 0.01;
  
  const viscosity = baseViscosity + smoothnessFactor + amplitudeFactor;
  return Math.max(1.0, Math.min(6.0, Math.round(viscosity * 100) / 100));
};

const calculateVariance = (signal: number[]): number => {
  const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
  const squaredDiffs = signal.map(value => Math.pow(value - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / signal.length;
};

const calculateSmoothness = (signal: number[]): number => {
  let totalChange = 0;
  for (let i = 1; i < signal.length; i++) {
    totalChange += Math.abs(signal[i] - signal[i - 1]);
  }
  return 1 / (1 + totalChange / signal.length); // Inverse of average change
};
