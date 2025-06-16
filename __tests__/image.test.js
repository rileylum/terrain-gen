import { noiseToPixel, createImageBuffer } from '../image';
describe('Image Generation', () => {
    describe('noiseToPixel', () => {
        it('should convert noise range to pixel range', () => {
            expect(noiseToPixel(-1)).toBe(0);
            expect(noiseToPixel(0)).toBe(127);
            expect(noiseToPixel(1)).toBe(255);
        });
        it('should handle edge cases', () => {
            expect(noiseToPixel(-1.5)).toBe(-64);
            expect(noiseToPixel(1.5)).toBe(318);
        });
        it('should handle typical Perlin noise range', () => {
            expect(noiseToPixel(-0.8)).toBe(25);
            expect(noiseToPixel(0.3)).toBe(165);
            expect(noiseToPixel(-0.2)).toBe(102);
        });
    });
    describe('createImageBuffer', () => {
        it('should create buffer with correct size', () => {
            const imageSize = 4;
            const noiseArray = [
                [0.5, -0.3, 0.8, -0.1],
                [-0.7, 0.2, -0.5, 0.9],
                [0.1, -0.8, 0.6, -0.4],
                [0.3, -0.1, -0.9, 0.7],
            ];
            const buffer = createImageBuffer(imageSize, noiseArray);
            expect(buffer).toBeInstanceOf(Uint8Array);
            expect(buffer.length).toBe(16);
        });
        it('should convert noise values to pixels correctly', () => {
            const imageSize = 2;
            const noiseArray = [
                [-1, 1],
                [0, 0.5],
            ];
            const buffer = createImageBuffer(imageSize, noiseArray);
            expect(buffer[0]).toBe(0); // noiseToPixel(-1)
            expect(buffer[1]).toBe(255); // noiseToPixel(1)
            expect(buffer[2]).toBe(127); // noiseToPixel(0)
            expect(buffer[3]).toBe(191); // noiseToPixel(0.5)
        });
    });
});
//# sourceMappingURL=image.test.js.map