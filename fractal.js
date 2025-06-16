import { createPerlinNoise } from './perlin.js';
export function createFractalNoise(octaveCount, imageSize, initialScaleFactor) {
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
        fractalNoise.forEach((row, y) => {
            row.forEach((val, x) => {
                fractalNoise[y][x] = val + currentOctave[y][x] * amplitude;
            });
        });
    }
    // Normalize the final result
    fractalNoise.forEach((row, y) => {
        row.forEach((val, x) => {
            fractalNoise[y][x] = val / normalization;
        });
    });
    return fractalNoise;
}
//# sourceMappingURL=fractal.js.map