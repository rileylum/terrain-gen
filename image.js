export function noiseToPixel(noiseValue) {
    // noiseValue ranges between -1 and 1.
    // add 1 to make values always positive
    // values are te 0 to 2, times 127.5 gets to 0 and 255
    return Math.floor((noiseValue + 1) * 127.5);
}
export const TERRAIN_CONFIG = {
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
export function getTerrain(elevation, terrainConfig = TERRAIN_CONFIG) {
    var _a;
    for (const terrain of Object.values(terrainConfig)) {
        if (elevation >= terrain.minElevation &&
            elevation <= terrain.maxElevation) {
            return terrain.color;
        }
    }
    // Fallback to grassland if no match
    return ((_a = terrainConfig.GRASSLAND) === null || _a === void 0 ? void 0 : _a.color) || TERRAIN_CONFIG.GRASSLAND.color;
}
export function createImageBuffer(imageSize, noiseArray, terrainConfig = TERRAIN_CONFIG) {
    const imageBuffer = new Uint8Array(Math.pow(imageSize, 2) * 4); // 4 bytes per pixel (RGBA)
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
//# sourceMappingURL=image.js.map