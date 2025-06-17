import {
  ImageSize,
  NoiseValue,
  PixelValue,
  NoiseArray,
  ImageBuffer,
  RGBAValue,
  TerrainConfig,
} from './types';

export function noiseToPixel(noiseValue: NoiseValue): PixelValue {
  // noiseValue ranges between -1 and 1.
  // add 1 to make values always positive
  // values are te 0 to 2, times 127.5 gets to 0 and 255
  return Math.floor((noiseValue + 1) * 127.5);
}

export const TERRAIN_CONFIG: TerrainConfig = {
  DEEP_WATER: {
    minElevation: -1.0,
    maxElevation: 0.0,
    color: { R: 30, G: 58, B: 138, A: 255 },
  },
  SHALLOW_WATER: {
    minElevation: 0.0,
    maxElevation: 0.1,
    color: { R: 59, G: 130, B: 246, A: 255 },
  },
  BEACH: {
    minElevation: 0.1,
    maxElevation: 0.15,
    color: { R: 251, G: 191, B: 36, A: 255 },
  },
  GRASSLAND: {
    minElevation: 0.15,
    maxElevation: 0.3,
    color: { R: 22, G: 163, B: 74, A: 255 },
  },
  HILLS: {
    minElevation: 0.3,
    maxElevation: 0.4,
    color: { R: 139, G: 69, B: 19, A: 255 },
  },
  MOUNTAIN: {
    minElevation: 0.4,
    maxElevation: 1.0,
    color: { R: 243, G: 244, B: 246, A: 255 },
  },
};

export function getTerrain(
  elevation: NoiseValue,
  terrainConfig: TerrainConfig = TERRAIN_CONFIG
): RGBAValue {
  for (const terrain of Object.values(terrainConfig)) {
    if (
      elevation >= terrain.minElevation &&
      elevation <= terrain.maxElevation
    ) {
      return terrain.color;
    }
  }
  // Fallback to grassland if no match
  return terrainConfig.GRASSLAND?.color || TERRAIN_CONFIG.GRASSLAND.color;
}

export function createImageBuffer(
  imageSize: ImageSize,
  noiseArray: NoiseArray,
  terrainConfig: TerrainConfig = TERRAIN_CONFIG
): ImageBuffer {
  const imageBuffer = new Uint8Array(imageSize ** 2 * 4); // 4 bytes per pixel (RGBA)
  for (let y = 0; y < imageSize; y++) {
    for (let x = 0; x < imageSize; x++) {
      const pixelIndex = (y * imageSize + x) * 4;
      const terrainColor = getTerrain(noiseArray[y][x], terrainConfig);
      imageBuffer[pixelIndex] = terrainColor.R; // R
      imageBuffer[pixelIndex + 1] = terrainColor.G; // G
      imageBuffer[pixelIndex + 2] = terrainColor.B; // B
      imageBuffer[pixelIndex + 3] = terrainColor.A; // A
    }
  }
  return imageBuffer;
}
