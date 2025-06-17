import sharp from 'sharp';
import { createFractalNoise } from './fractal.js';
import { createImageBuffer } from './image.js';

const imageSize = 256;
const octaveCount = 4;
const initialScaleFactor = 0.05;

const noiseArray = createFractalNoise(
  octaveCount,
  imageSize,
  initialScaleFactor
);

const coloredImageBuffer = createImageBuffer(imageSize, noiseArray);

sharp(coloredImageBuffer, {
  raw: { width: imageSize, height: imageSize, channels: 4 },
})
  .png()
  .toFile('dist/noise.png');
