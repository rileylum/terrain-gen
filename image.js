export function noiseToPixel(noiseValue) {
    // noiseValue ranges between -1 and 1.
    // add 1 to make values always positive
    // values are te 0 to 2, times 127.5 gets to 0 and 255
    return Math.floor((noiseValue + 1) * 127.5);
}
export function createImageBuffer(imageSize, noiseArray) {
    const imageBuffer = new Uint8Array(Math.pow(imageSize, 2));
    for (let y = 0; y < imageSize; y++) {
        for (let x = 0; x < imageSize; x++) {
            imageBuffer[y * imageSize + x] = noiseToPixel(noiseArray[y][x]);
        }
    }
    return imageBuffer;
}
//# sourceMappingURL=image.js.map