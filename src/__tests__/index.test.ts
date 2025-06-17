import sharp from 'sharp';
import { createPerlinNoise } from '../perlin';
import { createImageBuffer } from '../image';

// Mock sharp to avoid actual file I/O during tests
jest.mock('sharp');
jest.mock('../perlin');
jest.mock('../image');

const mockSharp = sharp as jest.MockedFunction<typeof sharp>;
const mockCreatePerlinNoise = createPerlinNoise as jest.MockedFunction<
  typeof createPerlinNoise
>;
const mockCreateImageBuffer = createImageBuffer as jest.MockedFunction<
  typeof createImageBuffer
>;

describe('Index Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock sharp chain
    const mockToFile = jest.fn().mockResolvedValue(undefined);
    const mockPng = jest.fn().mockReturnValue({ toFile: mockToFile });
    mockSharp.mockReturnValue({ png: mockPng } as any);

    // Mock createPerlinNoise to return a sample noise array
    mockCreatePerlinNoise.mockReturnValue([
      [0, 0.5],
      [-0.5, 1],
    ]);

    // Mock createImageBuffer to return a sample buffer
    mockCreateImageBuffer.mockReturnValue(new Uint8Array([0, 127, 255, 64]));
  });

  it('should generate noise and create PNG file', async () => {
    // Import the module to execute its code
    await import('../index');

    // Verify createPerlinNoise was called with correct parameters
    expect(mockCreatePerlinNoise).toHaveBeenCalledWith(256, 0.1);

    // Verify sharp was called with correct parameters
    expect(mockSharp).toHaveBeenCalledWith(expect.any(Uint8Array), {
      raw: { width: 256, height: 256, channels: 4 },
    });
  });
});
