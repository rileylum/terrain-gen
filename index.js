import sharp from 'sharp';
import { createPerlinNoise } from './perlin';
const imageSize = 256;
const scaleFactor = 0.1;
const imageBuffer = createPerlinNoise(imageSize, scaleFactor);
sharp(imageBuffer, {
    raw: { width: imageSize, height: imageSize, channels: 1 },
})
    .png()
    .toFile('dist/noise.png');
//# sourceMappingURL=index.js.map