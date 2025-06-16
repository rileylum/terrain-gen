var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import sharp from 'sharp';
import { createPerlinNoise } from '../perlin';
import { createImageBuffer } from '../image';
// Mock sharp to avoid actual file I/O during tests
jest.mock('sharp');
jest.mock('../perlin');
jest.mock('../image');
const mockSharp = sharp;
const mockCreatePerlinNoise = createPerlinNoise;
const mockCreateImageBuffer = createImageBuffer;
describe('Index Module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock sharp chain
        const mockToFile = jest.fn().mockResolvedValue(undefined);
        const mockPng = jest.fn().mockReturnValue({ toFile: mockToFile });
        mockSharp.mockReturnValue({ png: mockPng });
        // Mock createPerlinNoise to return a sample noise array
        mockCreatePerlinNoise.mockReturnValue([[0, 0.5], [-0.5, 1]]);
        // Mock createImageBuffer to return a sample buffer
        mockCreateImageBuffer.mockReturnValue(new Uint8Array([0, 127, 255, 64]));
    });
    it('should generate noise and create PNG file', () => __awaiter(void 0, void 0, void 0, function* () {
        // Import the module to execute its code
        yield import('../index');
        // Verify createPerlinNoise was called with correct parameters
        expect(mockCreatePerlinNoise).toHaveBeenCalledWith(256, 0.1);
        // Verify sharp was called with correct parameters
        expect(mockSharp).toHaveBeenCalledWith(expect.any(Uint8Array), {
            raw: { width: 256, height: 256, channels: 1 },
        });
    }));
});
//# sourceMappingURL=index.test.js.map