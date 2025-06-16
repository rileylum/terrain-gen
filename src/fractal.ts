import { ImageSize, NoiseValue, NoiseArray, ScaleFactor } from './types.js';
import { createPerlinNoise } from './perlin.js';

export function createFractalNoise(
  octaveCount: number,
  imageSize: ImageSize,
  initialScaleFactor: ScaleFactor
): NoiseArray {
  // Initialize with first octave
  let frequency = initialScaleFactor;
  let amplitude = 1;
  let normalization = 1;

  // Start with the first octave
  const fractalNoise = createPerlinNoise(imageSize, frequency); // ampltidue = 1

  // Generate and combine remaining octaves one at a time
  for (let i = 1; i < octaveCount; i++) {
    frequency *= 2;
    amplitude *= 0.5;
    normalization += amplitude;

    // Generate this octave and immediately combine it
    const currentOctave = createPerlinNoise(imageSize, frequency);
    fractalNoise.forEach((row: NoiseValue[], y: number) => {
      row.forEach((val: NoiseValue, x: number) => {
        fractalNoise[y][x] = val + currentOctave[y][x] * amplitude;
      });
    });
  }

  // Normalize the final result
  fractalNoise.forEach((row: NoiseValue[], y: number) => {
    row.forEach((val: NoiseValue, x: number) => {
      fractalNoise[y][x] = val / normalization;
    });
  });

  return fractalNoise;
}
