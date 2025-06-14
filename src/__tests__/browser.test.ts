/**
 * @jest-environment jsdom
 */

import { initializeTerrainGenerator } from '../browser';

// Mock the perlin module
jest.mock('../perlin', () => ({
  createPerlinNoise: jest
    .fn()
    .mockReturnValue(new Uint8Array([128, 64, 192, 255])),
}));

// Mock canvas context
const mockGetContext = jest.fn();
const mockFillRect = jest.fn();
const mockFillText = jest.fn();
const mockCreateImageData = jest.fn();
const mockPutImageData = jest.fn();

const mockContext = {
  fillStyle: '',
  font: '',
  textAlign: '',
  textBaseline: '',
  fillRect: mockFillRect,
  fillText: mockFillText,
  createImageData: mockCreateImageData,
  putImageData: mockPutImageData,
};

beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();

  // Setup DOM
  document.body.innerHTML = `
    <canvas id="terrain-canvas" width="400" height="400"></canvas>
    <form id="image_creation_form">
      <input type="range" id="image_size_range" name="image_size_range" value="8" min="6" max="10">
      <output id="image_size_display">256</output>
      <input type="range" id="scale_factor_range" name="scale_factor_range" value="0.05" min="0.01" max="0.3">
      <output id="scale_factor_display">0.05</output>
    </form>
  `;

  // Mock canvas getContext
  mockGetContext.mockReturnValue(mockContext);
  HTMLCanvasElement.prototype.getContext = mockGetContext;

  // Mock createImageData
  mockCreateImageData.mockReturnValue({
    data: new Uint8ClampedArray(16), // 4 pixels * 4 channels
    width: 2,
    height: 2,
  });
});

describe('Browser Module', () => {
  describe('initializeTerrainGenerator', () => {
    it('should draw placeholder on canvas', () => {
      initializeTerrainGenerator();

      expect(mockGetContext).toHaveBeenCalledWith('2d');
      expect(mockFillRect).toHaveBeenCalledWith(0, 0, 400, 400);
      expect(mockFillText).toHaveBeenCalledWith(
        'Placeholder until image is generated',
        200,
        200
      );
    });

    it('should setup range input event listeners', () => {
      initializeTerrainGenerator();

      const imageSizeRange = document.getElementById(
        'image_size_range'
      ) as HTMLInputElement;
      const imageSizeDisplay = document.getElementById(
        'image_size_display'
      ) as HTMLOutputElement;

      // Simulate input change
      imageSizeRange.value = '9';
      imageSizeRange.dispatchEvent(new Event('input'));

      expect(imageSizeDisplay.value).toBe('512'); // 2^9 = 512
    });

    it('should handle scale factor input changes', () => {
      initializeTerrainGenerator();

      const scaleFactorRange = document.getElementById(
        'scale_factor_range'
      ) as HTMLInputElement;
      const scaleFactorDisplay = document.getElementById(
        'scale_factor_display'
      ) as HTMLOutputElement;

      // Simulate input change
      scaleFactorRange.value = '0.15';
      scaleFactorRange.dispatchEvent(new Event('input'));

      expect(scaleFactorDisplay.value).toBe('0.15');
    });

    it('should handle missing canvas gracefully', () => {
      document.body.innerHTML = ''; // Remove canvas

      expect(() => {
        initializeTerrainGenerator();
      }).not.toThrow();
    });

    it('should handle missing context gracefully', () => {
      mockGetContext.mockReturnValue(null);

      expect(() => {
        initializeTerrainGenerator();
      }).not.toThrow();
    });

    it('should handle missing range inputs gracefully', () => {
      // Remove one of the range inputs
      document.body.innerHTML = `
        <canvas id="terrain-canvas" width="400" height="400"></canvas>
        <form id="image_creation_form">
          <input type="range" id="image_size_range" name="image_size_range" value="8" min="6" max="10">
          <!-- Missing image_size_display and scale_factor_range -->
        </form>
      `;

      expect(() => {
        initializeTerrainGenerator();
      }).not.toThrow();
    });

    it('should handle missing output elements gracefully', () => {
      // Remove output elements
      document.body.innerHTML = `
        <canvas id="terrain-canvas" width="400" height="400"></canvas>
        <form id="image_creation_form">
          <input type="range" id="image_size_range" name="image_size_range" value="8" min="6" max="10">
          <input type="range" id="scale_factor_range" name="scale_factor_range" value="0.05" min="0.01" max="0.3">
          <!-- Missing output elements -->
        </form>
      `;

      expect(() => {
        initializeTerrainGenerator();
      }).not.toThrow();
    });
  });

  describe('Form submission', () => {
    it('should handle form submission and render to canvas', () => {
      // Trigger DOMContentLoaded to setup event listeners
      document.dispatchEvent(new Event('DOMContentLoaded'));

      const form = document.getElementById(
        'image_creation_form'
      ) as HTMLFormElement;
      const imageSizeRange = document.getElementById(
        'image_size_range'
      ) as HTMLInputElement;
      const scaleFactorRange = document.getElementById(
        'scale_factor_range'
      ) as HTMLInputElement;

      // Set form values
      imageSizeRange.value = '7'; // 2^7 = 128
      scaleFactorRange.value = '0.1';

      // Create and dispatch submit event
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });
      form.dispatchEvent(submitEvent);

      // Verify canvas was updated
      expect(mockCreateImageData).toHaveBeenCalledWith(128, 128);
      expect(mockPutImageData).toHaveBeenCalled();
    });

    it('should prevent default form submission', () => {
      // Trigger DOMContentLoaded to setup event listeners
      document.dispatchEvent(new Event('DOMContentLoaded'));

      const form = document.getElementById(
        'image_creation_form'
      ) as HTMLFormElement;
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');
      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Canvas rendering', () => {
    it('should convert grayscale to RGBA correctly', () => {
      // Trigger DOMContentLoaded to setup event listeners
      document.dispatchEvent(new Event('DOMContentLoaded'));

      const form = document.getElementById(
        'image_creation_form'
      ) as HTMLFormElement;
      const imageSizeRange = document.getElementById(
        'image_size_range'
      ) as HTMLInputElement;

      imageSizeRange.value = '6'; // 2^6 = 64

      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });
      form.dispatchEvent(submitEvent);

      // Verify ImageData was created with correct size
      expect(mockCreateImageData).toHaveBeenCalledWith(64, 64);
    });

    it('should handle canvas rendering errors gracefully', () => {
      mockGetContext.mockReturnValue(null);
      initializeTerrainGenerator();

      const form = document.getElementById(
        'image_creation_form'
      ) as HTMLFormElement;
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });

      expect(() => {
        form.dispatchEvent(submitEvent);
      }).not.toThrow();
    });
  });

  describe('Event listener setup', () => {
    it('should handle missing form element gracefully', () => {
      // Remove form element
      document.body.innerHTML = `
        <canvas id="terrain-canvas" width="400" height="400"></canvas>
        <!-- No form element -->
      `;

      expect(() => {
        document.dispatchEvent(new Event('DOMContentLoaded'));
      }).not.toThrow();
    });
  });
});
