// ============================================================
// Advanced Numerical Methods Library for Clinical Signal Processing
// Developed by Nehal Kader - Medical AI Specialist
// ============================================================

// ============= INTERPOLATION METHODS =============

/**
 * Lagrange Polynomial Interpolation
 * Used for smooth signal reconstruction between sample points
 */
export function lagrangeInterpolation(xValues: number[], yValues: number[], x: number): number {
  let result = 0;
  const n = xValues.length;
  
  for (let i = 0; i < n; i++) {
    let term = yValues[i];
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        term *= (x - xValues[j]) / (xValues[i] - xValues[j]);
      }
    }
    result += term;
  }
  
  return result;
}

/**
 * Newton's Divided Difference Interpolation
 * More efficient for adding new data points
 */
export function newtonInterpolation(xValues: number[], yValues: number[], x: number): number {
  const n = xValues.length;
  const dividedDiff: number[][] = [];
  
  // Initialize first column with y values
  for (let i = 0; i < n; i++) {
    dividedDiff[i] = [yValues[i]];
  }
  
  // Calculate divided differences
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      const diff = (dividedDiff[i + 1][j - 1] - dividedDiff[i][j - 1]) / 
                   (xValues[i + j] - xValues[i]);
      dividedDiff[i].push(diff);
    }
  }
  
  // Calculate interpolated value
  let result = dividedDiff[0][0];
  let term = 1;
  
  for (let i = 1; i < n; i++) {
    term *= (x - xValues[i - 1]);
    result += dividedDiff[0][i] * term;
  }
  
  return result;
}

/**
 * Cubic Spline Interpolation
 * Provides smooth, continuous curves for PPG signal processing
 */
export function cubicSplineInterpolation(xValues: number[], yValues: number[]): (x: number) => number {
  const n = xValues.length - 1;
  const h: number[] = [];
  const alpha: number[] = [];
  const l: number[] = [1];
  const mu: number[] = [0];
  const z: number[] = [0];
  const c: number[] = new Array(n + 1).fill(0);
  const b: number[] = new Array(n).fill(0);
  const d: number[] = new Array(n).fill(0);
  
  // Step 1: Calculate h values
  for (let i = 0; i < n; i++) {
    h[i] = xValues[i + 1] - xValues[i];
  }
  
  // Step 2: Calculate alpha values
  for (let i = 1; i < n; i++) {
    alpha[i] = (3 / h[i]) * (yValues[i + 1] - yValues[i]) - 
               (3 / h[i - 1]) * (yValues[i] - yValues[i - 1]);
  }
  
  // Step 3: Solve tridiagonal system
  for (let i = 1; i < n; i++) {
    l[i] = 2 * (xValues[i + 1] - xValues[i - 1]) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / l[i];
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
  }
  
  l[n] = 1;
  z[n] = 0;
  c[n] = 0;
  
  // Step 4: Back substitution
  for (let j = n - 1; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] = (yValues[j + 1] - yValues[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }
  
  // Return interpolation function
  return (x: number): number => {
    // Find the correct interval
    let i = 0;
    for (let j = n - 1; j >= 0; j--) {
      if (x >= xValues[j]) {
        i = j;
        break;
      }
    }
    
    const dx = x - xValues[i];
    return yValues[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
  };
}

// ============= NUMERICAL DIFFERENTIATION =============

/**
 * Forward Difference Derivative (First Order)
 */
export function forwardDifference(signal: number[], h: number = 1): number[] {
  const derivative: number[] = [];
  for (let i = 0; i < signal.length - 1; i++) {
    derivative.push((signal[i + 1] - signal[i]) / h);
  }
  derivative.push(derivative[derivative.length - 1]); // Extend to same length
  return derivative;
}

/**
 * Backward Difference Derivative (First Order)
 */
export function backwardDifference(signal: number[], h: number = 1): number[] {
  const derivative: number[] = [0];
  for (let i = 1; i < signal.length; i++) {
    derivative.push((signal[i] - signal[i - 1]) / h);
  }
  return derivative;
}

/**
 * Central Difference Derivative (Second Order - More Accurate)
 */
export function centralDifference(signal: number[], h: number = 1): number[] {
  const derivative: number[] = [];
  derivative.push((signal[1] - signal[0]) / h); // Forward for first point
  
  for (let i = 1; i < signal.length - 1; i++) {
    derivative.push((signal[i + 1] - signal[i - 1]) / (2 * h));
  }
  
  derivative.push((signal[signal.length - 1] - signal[signal.length - 2]) / h); // Backward for last
  return derivative;
}

/**
 * Five-Point Stencil Derivative (Fourth Order - Highest Accuracy)
 */
export function fivePointStencil(signal: number[], h: number = 1): number[] {
  const derivative: number[] = [];
  
  // Use central difference for first two points
  derivative.push((signal[1] - signal[0]) / h);
  derivative.push((signal[2] - signal[0]) / (2 * h));
  
  // Five-point stencil for interior points
  for (let i = 2; i < signal.length - 2; i++) {
    const d = (-signal[i + 2] + 8 * signal[i + 1] - 8 * signal[i - 1] + signal[i - 2]) / (12 * h);
    derivative.push(d);
  }
  
  // Use central difference for last two points
  derivative.push((signal[signal.length - 1] - signal[signal.length - 3]) / (2 * h));
  derivative.push((signal[signal.length - 1] - signal[signal.length - 2]) / h);
  
  return derivative;
}

/**
 * Second Derivative using Central Difference
 */
export function secondDerivative(signal: number[], h: number = 1): number[] {
  const derivative: number[] = [0];
  
  for (let i = 1; i < signal.length - 1; i++) {
    derivative.push((signal[i + 1] - 2 * signal[i] + signal[i - 1]) / (h * h));
  }
  
  derivative.push(0);
  return derivative;
}

// ============= NUMERICAL INTEGRATION =============

/**
 * Trapezoidal Rule Integration
 */
export function trapezoidalRule(signal: number[], h: number = 1): number {
  let sum = 0;
  for (let i = 0; i < signal.length - 1; i++) {
    sum += (signal[i] + signal[i + 1]) * h / 2;
  }
  return sum;
}

/**
 * Simpson's 1/3 Rule Integration (More Accurate)
 */
export function simpsonsRule(signal: number[], h: number = 1): number {
  const n = signal.length - 1;
  if (n % 2 !== 0) {
    // Use trapezoidal for last segment if odd
    return simpsonsRule(signal.slice(0, -1), h) + 
           (signal[signal.length - 2] + signal[signal.length - 1]) * h / 2;
  }
  
  let sum = signal[0] + signal[n];
  
  for (let i = 1; i < n; i++) {
    sum += (i % 2 === 0 ? 2 : 4) * signal[i];
  }
  
  return sum * h / 3;
}

/**
 * Simpson's 3/8 Rule Integration
 */
export function simpsons38Rule(signal: number[], h: number = 1): number {
  const n = signal.length - 1;
  if (n % 3 !== 0) {
    // Fallback to Simpson's 1/3
    return simpsonsRule(signal, h);
  }
  
  let sum = signal[0] + signal[n];
  
  for (let i = 1; i < n; i++) {
    sum += (i % 3 === 0 ? 2 : 3) * signal[i];
  }
  
  return sum * 3 * h / 8;
}

/**
 * Romberg Integration (Adaptive, High Accuracy)
 */
export function rombergIntegration(signal: number[], h: number = 1, maxIterations: number = 5): number {
  const R: number[][] = [];
  
  // Initialize first approximation with trapezoidal rule
  R[0] = [trapezoidalRule(signal, h)];
  
  for (let i = 1; i <= maxIterations; i++) {
    // Calculate more refined trapezoidal approximation
    const numSubintervals = Math.pow(2, i);
    const subH = h / numSubintervals;
    
    let newSum = 0;
    for (let j = 1; j < numSubintervals; j += 2) {
      const index = Math.min(Math.floor(j * signal.length / numSubintervals), signal.length - 1);
      newSum += signal[index];
    }
    
    R[i] = [];
    R[i][0] = R[i - 1][0] / 2 + subH * newSum;
    
    // Richardson extrapolation
    for (let j = 1; j <= i; j++) {
      const factor = Math.pow(4, j);
      R[i][j] = (factor * R[i][j - 1] - R[i - 1][j - 1]) / (factor - 1);
    }
  }
  
  return R[maxIterations][maxIterations];
}

/**
 * Cumulative Integration (Running Integral)
 */
export function cumulativeIntegration(signal: number[], h: number = 1): number[] {
  const integral: number[] = [0];
  
  for (let i = 1; i < signal.length; i++) {
    integral.push(integral[i - 1] + (signal[i] + signal[i - 1]) * h / 2);
  }
  
  return integral;
}

// ============= ROOT FINDING METHODS =============

/**
 * Newton-Raphson Method for Finding Roots
 */
export function newtonRaphson(
  f: (x: number) => number,
  fPrime: (x: number) => number,
  x0: number,
  tolerance: number = 1e-6,
  maxIterations: number = 100
): number {
  let x = x0;
  
  for (let i = 0; i < maxIterations; i++) {
    const fx = f(x);
    const fpx = fPrime(x);
    
    if (Math.abs(fpx) < 1e-12) break;
    
    const xNew = x - fx / fpx;
    
    if (Math.abs(xNew - x) < tolerance) {
      return xNew;
    }
    
    x = xNew;
  }
  
  return x;
}

/**
 * Bisection Method for Finding Roots
 */
export function bisectionMethod(
  f: (x: number) => number,
  a: number,
  b: number,
  tolerance: number = 1e-6,
  maxIterations: number = 100
): number {
  if (f(a) * f(b) >= 0) {
    return (a + b) / 2; // No sign change, return midpoint
  }
  
  let left = a;
  let right = b;
  
  for (let i = 0; i < maxIterations; i++) {
    const mid = (left + right) / 2;
    const fMid = f(mid);
    
    if (Math.abs(fMid) < tolerance || (right - left) / 2 < tolerance) {
      return mid;
    }
    
    if (f(left) * fMid < 0) {
      right = mid;
    } else {
      left = mid;
    }
  }
  
  return (left + right) / 2;
}

/**
 * Secant Method for Finding Roots (No Derivative Needed)
 */
export function secantMethod(
  f: (x: number) => number,
  x0: number,
  x1: number,
  tolerance: number = 1e-6,
  maxIterations: number = 100
): number {
  let xPrev = x0;
  let xCurr = x1;
  
  for (let i = 0; i < maxIterations; i++) {
    const fPrev = f(xPrev);
    const fCurr = f(xCurr);
    
    if (Math.abs(fCurr - fPrev) < 1e-12) break;
    
    const xNew = xCurr - fCurr * (xCurr - xPrev) / (fCurr - fPrev);
    
    if (Math.abs(xNew - xCurr) < tolerance) {
      return xNew;
    }
    
    xPrev = xCurr;
    xCurr = xNew;
  }
  
  return xCurr;
}

// ============= CURVE FITTING & REGRESSION =============

/**
 * Linear Least Squares Regression
 */
export function linearRegression(xValues: number[], yValues: number[]): { slope: number; intercept: number; r2: number } {
  const n = xValues.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumX2 += xValues[i] * xValues[i];
    sumY2 += yValues[i] * yValues[i];
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const meanY = sumY / n;
  let ssTot = 0, ssRes = 0;
  
  for (let i = 0; i < n; i++) {
    const predicted = slope * xValues[i] + intercept;
    ssTot += Math.pow(yValues[i] - meanY, 2);
    ssRes += Math.pow(yValues[i] - predicted, 2);
  }
  
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  
  return { slope, intercept, r2 };
}

/**
 * Polynomial Regression (Least Squares)
 */
export function polynomialRegression(xValues: number[], yValues: number[], degree: number): number[] {
  const n = xValues.length;
  const m = degree + 1;
  
  // Build Vandermonde matrix
  const A: number[][] = [];
  for (let i = 0; i < n; i++) {
    A[i] = [];
    for (let j = 0; j < m; j++) {
      A[i][j] = Math.pow(xValues[i], j);
    }
  }
  
  // Solve normal equations: (A^T * A) * coeffs = A^T * y
  const ATA: number[][] = [];
  const ATy: number[] = [];
  
  for (let i = 0; i < m; i++) {
    ATA[i] = [];
    ATy[i] = 0;
    for (let j = 0; j < m; j++) {
      ATA[i][j] = 0;
      for (let k = 0; k < n; k++) {
        ATA[i][j] += A[k][i] * A[k][j];
      }
    }
    for (let k = 0; k < n; k++) {
      ATy[i] += A[k][i] * yValues[k];
    }
  }
  
  // Solve using Gaussian elimination
  return gaussianElimination(ATA, ATy);
}

/**
 * Exponential Fitting: y = a * exp(b * x)
 */
export function exponentialFit(xValues: number[], yValues: number[]): { a: number; b: number } {
  // Transform to linear: ln(y) = ln(a) + b*x
  const logY = yValues.map(y => Math.log(Math.max(y, 1e-10)));
  const { slope, intercept } = linearRegression(xValues, logY);
  
  return {
    a: Math.exp(intercept),
    b: slope
  };
}

/**
 * Power Fitting: y = a * x^b
 */
export function powerFit(xValues: number[], yValues: number[]): { a: number; b: number } {
  // Transform to linear: ln(y) = ln(a) + b*ln(x)
  const logX = xValues.map(x => Math.log(Math.max(x, 1e-10)));
  const logY = yValues.map(y => Math.log(Math.max(y, 1e-10)));
  const { slope, intercept } = linearRegression(logX, logY);
  
  return {
    a: Math.exp(intercept),
    b: slope
  };
}

// ============= MATRIX OPERATIONS =============

/**
 * Gaussian Elimination with Partial Pivoting
 */
export function gaussianElimination(A: number[][], b: number[]): number[] {
  const n = b.length;
  const augmented: number[][] = A.map((row, i) => [...row, b[i]]);
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Partial pivoting
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Eliminate column
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[i][i]) < 1e-12) continue;
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }
  
  // Back substitution
  const x: number[] = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    if (Math.abs(augmented[i][i]) < 1e-12) continue;
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }
  
  return x;
}

/**
 * LU Decomposition
 */
export function luDecomposition(A: number[][]): { L: number[][]; U: number[][] } {
  const n = A.length;
  const L: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const U: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    L[i][i] = 1;
    
    for (let j = i; j < n; j++) {
      U[i][j] = A[i][j];
      for (let k = 0; k < i; k++) {
        U[i][j] -= L[i][k] * U[k][j];
      }
    }
    
    for (let j = i + 1; j < n; j++) {
      L[j][i] = A[j][i];
      for (let k = 0; k < i; k++) {
        L[j][i] -= L[j][k] * U[k][i];
      }
      if (Math.abs(U[i][i]) > 1e-12) {
        L[j][i] /= U[i][i];
      }
    }
  }
  
  return { L, U };
}

// ============= FFT & SPECTRAL ANALYSIS =============

/**
 * Fast Fourier Transform (Cooley-Tukey Algorithm)
 */
export function fft(signal: number[]): { real: number[]; imag: number[] } {
  const n = signal.length;
  
  // Pad to power of 2
  const paddedLength = Math.pow(2, Math.ceil(Math.log2(n)));
  const paddedSignal = [...signal, ...new Array(paddedLength - n).fill(0)];
  
  const real = [...paddedSignal];
  const imag = new Array(paddedLength).fill(0);
  
  // Bit-reversal permutation
  const bits = Math.log2(paddedLength);
  for (let i = 0; i < paddedLength; i++) {
    const j = parseInt(i.toString(2).padStart(bits, '0').split('').reverse().join(''), 2);
    if (j > i) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }
  
  // FFT butterfly
  for (let size = 2; size <= paddedLength; size *= 2) {
    const halfSize = size / 2;
    const angleStep = -2 * Math.PI / size;
    
    for (let i = 0; i < paddedLength; i += size) {
      for (let j = 0; j < halfSize; j++) {
        const angle = angleStep * j;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const evenIndex = i + j;
        const oddIndex = i + j + halfSize;
        
        const tReal = cos * real[oddIndex] - sin * imag[oddIndex];
        const tImag = sin * real[oddIndex] + cos * imag[oddIndex];
        
        real[oddIndex] = real[evenIndex] - tReal;
        imag[oddIndex] = imag[evenIndex] - tImag;
        real[evenIndex] += tReal;
        imag[evenIndex] += tImag;
      }
    }
  }
  
  return { real, imag };
}

/**
 * Inverse FFT
 */
export function ifft(real: number[], imag: number[]): number[] {
  const n = real.length;
  
  // Conjugate
  const conjugatedImag = imag.map(v => -v);
  
  // Forward FFT
  const result = fft([...real]);
  
  // Scale and conjugate again
  return result.real.map(v => v / n);
}

/**
 * Power Spectral Density
 */
export function powerSpectralDensity(signal: number[], sampleRate: number = 60): { frequencies: number[]; power: number[] } {
  const { real, imag } = fft(signal);
  const n = real.length;
  
  const frequencies: number[] = [];
  const power: number[] = [];
  
  for (let i = 0; i < n / 2; i++) {
    frequencies.push((i * sampleRate) / n);
    power.push((real[i] * real[i] + imag[i] * imag[i]) / n);
  }
  
  return { frequencies, power };
}

/**
 * Dominant Frequency Detection
 */
export function findDominantFrequency(signal: number[], sampleRate: number = 60): number {
  const { frequencies, power } = powerSpectralDensity(signal, sampleRate);
  
  let maxPower = 0;
  let dominantFreq = 0;
  
  for (let i = 1; i < power.length; i++) { // Skip DC component
    if (power[i] > maxPower) {
      maxPower = power[i];
      dominantFreq = frequencies[i];
    }
  }
  
  return dominantFreq;
}

// ============= ADVANCED FILTERING =============

/**
 * Savitzky-Golay Filter (Polynomial Smoothing)
 */
export function savitzkyGolayFilter(signal: number[], windowSize: number = 5, polyOrder: number = 2): number[] {
  const halfWindow = Math.floor(windowSize / 2);
  const result = [...signal];
  
  // Calculate coefficients
  const coefficients = calculateSGCoefficients(windowSize, polyOrder);
  
  for (let i = halfWindow; i < signal.length - halfWindow; i++) {
    let smoothed = 0;
    for (let j = -halfWindow; j <= halfWindow; j++) {
      smoothed += coefficients[j + halfWindow] * signal[i + j];
    }
    result[i] = smoothed;
  }
  
  return result;
}

function calculateSGCoefficients(windowSize: number, polyOrder: number): number[] {
  const halfWindow = Math.floor(windowSize / 2);
  const n = windowSize;
  
  // Build Vandermonde matrix
  const J: number[][] = [];
  for (let i = -halfWindow; i <= halfWindow; i++) {
    const row: number[] = [];
    for (let j = 0; j <= polyOrder; j++) {
      row.push(Math.pow(i, j));
    }
    J.push(row);
  }
  
  // Calculate (J^T * J)^-1 * J^T
  const JTJ: number[][] = [];
  for (let i = 0; i <= polyOrder; i++) {
    JTJ[i] = [];
    for (let j = 0; j <= polyOrder; j++) {
      JTJ[i][j] = 0;
      for (let k = 0; k < n; k++) {
        JTJ[i][j] += J[k][i] * J[k][j];
      }
    }
  }
  
  // Invert matrix (simplified for small matrices)
  const invJTJ = invertMatrix(JTJ);
  
  // Calculate coefficients for the first derivative (row 0 for smoothing)
  const coefficients: number[] = [];
  for (let i = 0; i < n; i++) {
    let coef = 0;
    for (let j = 0; j <= polyOrder; j++) {
      coef += invJTJ[0][j] * J[i][j];
    }
    coefficients.push(coef);
  }
  
  return coefficients;
}

function invertMatrix(A: number[][]): number[][] {
  const n = A.length;
  const augmented: number[][] = A.map((row, i) => [...row, ...new Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]);
  
  // Gauss-Jordan elimination
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    const pivot = augmented[i][i];
    if (Math.abs(pivot) < 1e-12) continue;
    
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }
    
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }
  
  return augmented.map(row => row.slice(n));
}

/**
 * Moving Average Filter with Various Types
 */
export function movingAverage(signal: number[], windowSize: number, type: 'simple' | 'weighted' | 'exponential' = 'simple'): number[] {
  const result: number[] = [];
  
  switch (type) {
    case 'simple':
      for (let i = 0; i < signal.length; i++) {
        const start = Math.max(0, i - Math.floor(windowSize / 2));
        const end = Math.min(signal.length, i + Math.ceil(windowSize / 2));
        const window = signal.slice(start, end);
        result.push(window.reduce((sum, val) => sum + val, 0) / window.length);
      }
      break;
      
    case 'weighted':
      for (let i = 0; i < signal.length; i++) {
        const halfWindow = Math.floor(windowSize / 2);
        let weightedSum = 0;
        let totalWeight = 0;
        
        for (let j = -halfWindow; j <= halfWindow; j++) {
          const idx = i + j;
          if (idx >= 0 && idx < signal.length) {
            const weight = halfWindow + 1 - Math.abs(j);
            weightedSum += signal[idx] * weight;
            totalWeight += weight;
          }
        }
        
        result.push(weightedSum / totalWeight);
      }
      break;
      
    case 'exponential':
      const alpha = 2 / (windowSize + 1);
      result.push(signal[0]);
      for (let i = 1; i < signal.length; i++) {
        result.push(alpha * signal[i] + (1 - alpha) * result[i - 1]);
      }
      break;
  }
  
  return result;
}

/**
 * Kalman Filter (1D)
 */
export function kalmanFilter(
  signal: number[],
  processNoise: number = 0.01,
  measurementNoise: number = 0.1
): number[] {
  const result: number[] = [];
  
  let estimate = signal[0];
  let errorCovariance = 1;
  
  for (const measurement of signal) {
    // Prediction
    const predictedEstimate = estimate;
    const predictedErrorCovariance = errorCovariance + processNoise;
    
    // Update
    const kalmanGain = predictedErrorCovariance / (predictedErrorCovariance + measurementNoise);
    estimate = predictedEstimate + kalmanGain * (measurement - predictedEstimate);
    errorCovariance = (1 - kalmanGain) * predictedErrorCovariance;
    
    result.push(estimate);
  }
  
  return result;
}

// ============= STATISTICAL METHODS =============

/**
 * Welch's Method for Power Spectral Estimation
 */
export function welchPSD(signal: number[], segmentSize: number = 64, overlap: number = 0.5, sampleRate: number = 60): { frequencies: number[]; power: number[] } {
  const step = Math.floor(segmentSize * (1 - overlap));
  const segments: number[][] = [];
  
  // Create overlapping segments
  for (let i = 0; i <= signal.length - segmentSize; i += step) {
    segments.push(signal.slice(i, i + segmentSize));
  }
  
  if (segments.length === 0) {
    return { frequencies: [], power: [] };
  }
  
  // Apply Hanning window to each segment
  const windowedSegments = segments.map(segment => {
    return segment.map((val, i) => val * (0.5 * (1 - Math.cos(2 * Math.PI * i / (segmentSize - 1)))));
  });
  
  // Calculate PSD for each segment and average
  const psds = windowedSegments.map(segment => powerSpectralDensity(segment, sampleRate));
  
  const frequencies = psds[0].frequencies;
  const power: number[] = frequencies.map(() => 0);
  
  for (const psd of psds) {
    for (let i = 0; i < psd.power.length; i++) {
      power[i] += psd.power[i] / segments.length;
    }
  }
  
  return { frequencies, power };
}

/**
 * Cross-Correlation
 */
export function crossCorrelation(signal1: number[], signal2: number[]): number[] {
  const n = signal1.length;
  const m = signal2.length;
  const result: number[] = [];
  
  for (let lag = -n + 1; lag < m; lag++) {
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < n; i++) {
      const j = i + lag;
      if (j >= 0 && j < m) {
        sum += signal1[i] * signal2[j];
        count++;
      }
    }
    
    result.push(count > 0 ? sum / count : 0);
  }
  
  return result;
}

/**
 * Autocorrelation
 */
export function autocorrelation(signal: number[], maxLag: number = -1): number[] {
  if (maxLag < 0) maxLag = Math.floor(signal.length / 2);
  
  const n = signal.length;
  const mean = signal.reduce((sum, val) => sum + val, 0) / n;
  const centeredSignal = signal.map(val => val - mean);
  
  const variance = centeredSignal.reduce((sum, val) => sum + val * val, 0) / n;
  
  const result: number[] = [];
  
  for (let lag = 0; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
      sum += centeredSignal[i] * centeredSignal[i + lag];
    }
    result.push(variance > 0 ? sum / (n * variance) : 0);
  }
  
  return result;
}

// ============= PEAK DETECTION =============

/**
 * Advanced Peak Detection using Numerical Derivatives
 */
export function detectPeaksNumerical(signal: number[], minProminence: number = 0.1): number[] {
  const firstDeriv = centralDifference(signal);
  const secondDeriv = secondDerivative(signal);
  
  const peaks: number[] = [];
  
  for (let i = 2; i < signal.length - 2; i++) {
    // Zero crossing in first derivative (from positive to negative)
    if (firstDeriv[i - 1] > 0 && firstDeriv[i + 1] < 0) {
      // Negative second derivative (concave down - local maximum)
      if (secondDeriv[i] < 0) {
        // Check prominence
        const prominence = calculateProminence(signal, i);
        if (prominence >= minProminence) {
          peaks.push(i);
        }
      }
    }
  }
  
  return peaks;
}

function calculateProminence(signal: number[], peakIndex: number): number {
  const peakValue = signal[peakIndex];
  
  // Find left base
  let leftMin = peakValue;
  for (let i = peakIndex - 1; i >= 0; i--) {
    leftMin = Math.min(leftMin, signal[i]);
    if (signal[i] > peakValue) break;
  }
  
  // Find right base
  let rightMin = peakValue;
  for (let i = peakIndex + 1; i < signal.length; i++) {
    rightMin = Math.min(rightMin, signal[i]);
    if (signal[i] > peakValue) break;
  }
  
  return peakValue - Math.max(leftMin, rightMin);
}

// ============= UTILITY FUNCTIONS =============

/**
 * Normalize signal to [0, 1] range
 */
export function normalizeSignal(signal: number[]): number[] {
  const min = Math.min(...signal);
  const max = Math.max(...signal);
  const range = max - min;
  
  if (range === 0) return signal.map(() => 0.5);
  
  return signal.map(val => (val - min) / range);
}

/**
 * Z-Score Normalization
 */
export function zScoreNormalize(signal: number[]): number[] {
  const mean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
  const variance = signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / signal.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return signal.map(() => 0);
  
  return signal.map(val => (val - mean) / stdDev);
}

/**
 * Resample signal to new length using interpolation
 */
export function resampleSignal(signal: number[], newLength: number): number[] {
  if (signal.length === newLength) return [...signal];
  
  const xOld = signal.map((_, i) => i);
  const xNew = Array.from({ length: newLength }, (_, i) => (i * (signal.length - 1)) / (newLength - 1));
  
  const spline = cubicSplineInterpolation(xOld, signal);
  return xNew.map(x => spline(x));
}

console.log('Advanced Numerical Methods Library loaded - Nehal Health System');
