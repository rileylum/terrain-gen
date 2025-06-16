export function createVector(randomNumber) {
    return { x: Math.cos(randomNumber), y: Math.sin(randomNumber) };
}
export function createVectorGrid(gridSize) {
    return Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => {
        return createVector(Math.random() * 2 * Math.PI);
    }));
}
// Linear Interpolation
export function lerp(a, b, t) {
    return a + t * (b - a);
}
export function smoothStep(t) {
    return 3 * t * t - 2 * t * t * t;
}
export function sampleNoise(coordinate, vectorGrid) {
    //Calculate the grid position
    const gridX = Math.floor(coordinate.x);
    const gridY = Math.floor(coordinate.y);
    //Find the corner gradient vectors
    const topLeft = vectorGrid[gridY][gridX];
    const topRight = vectorGrid[gridY][gridX + 1];
    const bottomLeft = vectorGrid[gridY + 1][gridX];
    const bottomRight = vectorGrid[gridY + 1][gridX + 1];
    //Distance from sampling point to bottom-left corner
    const offsetX = coordinate.x - gridX;
    const offsetY = coordinate.y - gridY;
    //Calculate dot products (gradient . distance) for each corner
    const dotTL = topLeft.x * offsetX + topLeft.y * offsetY;
    const dotTR = topRight.x * (offsetX - 1) + topRight.y * offsetY;
    const dotBL = bottomLeft.x * offsetX + bottomLeft.y * (offsetY - 1);
    const dotBR = bottomRight.x * (offsetX - 1) + bottomRight.y * (offsetY - 1);
    //Smooth offset
    const smoothX = smoothStep(offsetX);
    const smoothY = smoothStep(offsetY);
    //Interpolate values
    const topValue = lerp(dotTL, dotTR, smoothX);
    const bottomValue = lerp(dotBL, dotBR, smoothX);
    return lerp(topValue, bottomValue, smoothY);
}
export function createNoiseArray(size, scale, vectorGrid) {
    return Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => sampleNoise({ x: x * scale, y: y * scale }, vectorGrid)));
}
export function createPerlinNoise(imageSize, scaleFactor) {
    const gridSize = Math.ceil(imageSize * scaleFactor) + 2;
    const vectorGrid = createVectorGrid(gridSize);
    const noiseArray = createNoiseArray(imageSize, scaleFactor, vectorGrid);
    return noiseArray;
}
//# sourceMappingURL=perlin.js.map