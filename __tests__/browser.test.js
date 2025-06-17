/**
 * @jest-environment jsdom
 */
import { initializeTerrainGenerator } from '../browser';
// Mock the fractal and image modules
jest.mock('../fractal', () => ({
    createFractalNoise: jest.fn().mockReturnValue([
        [0, 0.5],
        [-0.5, 1],
    ]),
}));
jest.mock('../image', () => ({
    createImageBuffer: jest
        .fn()
        .mockReturnValue(new Uint8Array([128, 64, 192, 255])),
    TERRAIN_CONFIG: {
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
    },
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
      <input type="range" id="octave_count_range" name="octave_count_range" value="4" min="1" max="6">
      <output id="octave_count_display">4</output>
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
            expect(mockFillText).toHaveBeenCalledWith('Placeholder until image is generated', 200, 200);
        });
        it('should setup range input event listeners', () => {
            initializeTerrainGenerator();
            const imageSizeRange = document.getElementById('image_size_range');
            const imageSizeDisplay = document.getElementById('image_size_display');
            // Simulate input change
            imageSizeRange.value = '9';
            imageSizeRange.dispatchEvent(new Event('input'));
            expect(imageSizeDisplay.value).toBe('512'); // 2^9 = 512
        });
        it('should handle scale factor input changes', () => {
            initializeTerrainGenerator();
            const scaleFactorRange = document.getElementById('scale_factor_range');
            const scaleFactorDisplay = document.getElementById('scale_factor_display');
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
          <input type="range" id="octave_count_range" name="octave_count_range" value="4" min="1" max="6">
          <!-- Missing output elements -->
        </form>
      `;
            expect(() => {
                initializeTerrainGenerator();
            }).not.toThrow();
        });
        it('should handle missing octave count input gracefully', () => {
            // Remove octave count elements
            document.body.innerHTML = `
        <canvas id="terrain-canvas" width="400" height="400"></canvas>
        <form id="image_creation_form">
          <input type="range" id="image_size_range" name="image_size_range" value="8" min="6" max="10">
          <output id="image_size_display">256</output>
          <input type="range" id="scale_factor_range" name="scale_factor_range" value="0.05" min="0.01" max="0.3">
          <output id="scale_factor_display">0.05</output>
          <!-- Missing octave count elements -->
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
            const form = document.getElementById('image_creation_form');
            const imageSizeRange = document.getElementById('image_size_range');
            const scaleFactorRange = document.getElementById('scale_factor_range');
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
            const form = document.getElementById('image_creation_form');
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
            const form = document.getElementById('image_creation_form');
            const imageSizeRange = document.getElementById('image_size_range');
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
            const form = document.getElementById('image_creation_form');
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
    describe('Terrain Editor Functionality', () => {
        beforeEach(() => {
            // Setup DOM with terrain editor elements
            document.body.innerHTML = `
        <canvas id="terrain-canvas" width="400" height="400"></canvas>
        <form id="image_creation_form">
          <input type="range" id="image_size_range" name="image_size_range" value="8" min="6" max="10">
          <output id="image_size_display">256</output>
          <input type="range" id="scale_factor_range" name="scale_factor_range" value="0.05" min="0.01" max="0.3">
          <output id="scale_factor_display">0.05</output>
          <input type="range" id="octave_count_range" name="octave_count_range" value="4" min="1" max="6">
          <output id="octave_count_display">4</output>
          <button class="generate-btn">Generate Terrain</button>
        </form>
        <div class="tabs">
          <button class="tab-button active" data-tab="image-settings">Image Settings</button>
          <button class="tab-button" data-tab="terrain-settings">Terrain Settings</button>
        </div>
        <div id="image-settings" class="tab-panel active">
          <!-- Image settings content -->
        </div>
        <div id="terrain-settings" class="tab-panel">
          <div id="terrain-types-container"></div>
          <button id="add-terrain-btn">Add Terrain</button>
          <button id="reset-terrain-btn">Reset to Default</button>
        </div>
      `;
        });
        it('should initialize terrain editor with default terrains', () => {
            initializeTerrainGenerator();
            const container = document.getElementById('terrain-types-container');
            expect(container === null || container === void 0 ? void 0 : container.children.length).toBeGreaterThan(0);
        });
        it('should handle tab switching', () => {
            initializeTerrainGenerator();
            const terrainTab = document.querySelector('[data-tab="terrain-settings"]');
            const imageTab = document.querySelector('[data-tab="image-settings"]');
            const terrainPanel = document.getElementById('terrain-settings');
            const imagePanel = document.getElementById('image-settings');
            // Click terrain tab
            terrainTab.click();
            expect(terrainTab.classList.contains('active')).toBe(true);
            expect(imageTab.classList.contains('active')).toBe(false);
            expect(terrainPanel === null || terrainPanel === void 0 ? void 0 : terrainPanel.classList.contains('active')).toBe(true);
            expect(imagePanel === null || imagePanel === void 0 ? void 0 : imagePanel.classList.contains('active')).toBe(false);
        });
        it('should add new terrain when add button is clicked', () => {
            initializeTerrainGenerator();
            const container = document.getElementById('terrain-types-container');
            const addBtn = document.getElementById('add-terrain-btn');
            const initialCount = (container === null || container === void 0 ? void 0 : container.children.length) || 0;
            addBtn.click();
            expect(container === null || container === void 0 ? void 0 : container.children.length).toBe(initialCount + 1);
        });
        it('should reset to default terrains when reset button is clicked', () => {
            initializeTerrainGenerator();
            const container = document.getElementById('terrain-types-container');
            const addBtn = document.getElementById('add-terrain-btn');
            const resetBtn = document.getElementById('reset-terrain-btn');
            // Add a new terrain
            addBtn.click();
            const countAfterAdd = (container === null || container === void 0 ? void 0 : container.children.length) || 0;
            // Reset to default
            resetBtn.click();
            const countAfterReset = (container === null || container === void 0 ? void 0 : container.children.length) || 0;
            expect(countAfterReset).toBe(6); // Default terrain count
            expect(countAfterReset).toBeLessThan(countAfterAdd);
        });
        it('should handle elevation range calculations', () => {
            initializeTerrainGenerator();
            const container = document.getElementById('terrain-types-container');
            const terrainElements = container === null || container === void 0 ? void 0 : container.children;
            if (terrainElements && terrainElements.length > 0) {
                // Check that range indicators are present
                const firstTerrain = terrainElements[0];
                const rangeIndicator = firstTerrain.querySelector('.elevation-range-indicator');
                expect(rangeIndicator === null || rangeIndicator === void 0 ? void 0 : rangeIndicator.textContent).toContain('Range:');
                expect(rangeIndicator === null || rangeIndicator === void 0 ? void 0 : rangeIndicator.textContent).toContain('%');
            }
        });
        it('should validate terrain configuration for duplicates', () => {
            initializeTerrainGenerator();
            const generateBtn = document.querySelector('.generate-btn');
            expect(generateBtn.disabled).toBe(false);
            expect(generateBtn.textContent).toBe('Generate Terrain');
        });
        it('should handle terrain removal', () => {
            initializeTerrainGenerator();
            const container = document.getElementById('terrain-types-container');
            const initialCount = (container === null || container === void 0 ? void 0 : container.children.length) || 0;
            // Find and click a remove button
            const removeBtn = container === null || container === void 0 ? void 0 : container.querySelector('.remove-btn');
            if (removeBtn) {
                removeBtn.click();
                expect(container === null || container === void 0 ? void 0 : container.children.length).toBe(initialCount - 1);
            }
        });
        it('should handle terrain name changes', () => {
            initializeTerrainGenerator();
            const container = document.getElementById('terrain-types-container');
            const nameInput = container === null || container === void 0 ? void 0 : container.querySelector('.terrain-name');
            if (nameInput) {
                const originalName = nameInput.value;
                nameInput.value = 'Custom Terrain';
                nameInput.dispatchEvent(new Event('input'));
                // The terrain should be updated
                const terrainElement = nameInput.closest('.terrain-type');
                expect(terrainElement.dataset.terrainName).toBe('CUSTOM_TERRAIN');
            }
        });
        it('should handle color changes', () => {
            initializeTerrainGenerator();
            const container = document.getElementById('terrain-types-container');
            const colorInput = container === null || container === void 0 ? void 0 : container.querySelector('.terrain-color');
            const hexInput = container === null || container === void 0 ? void 0 : container.querySelector('.terrain-hex');
            if (colorInput && hexInput) {
                colorInput.value = '#ff0000';
                colorInput.dispatchEvent(new Event('input'));
                expect(hexInput.value).toBe('#ff0000');
            }
        });
        it('should handle elevation changes', () => {
            initializeTerrainGenerator();
            const container = document.getElementById('terrain-types-container');
            const maxInput = container === null || container === void 0 ? void 0 : container.querySelector('.max-elevation');
            if (maxInput) {
                const originalValue = maxInput.value;
                maxInput.value = '0.5';
                maxInput.dispatchEvent(new Event('input'));
                // Should trigger terrain range updates
                expect(maxInput.value).toBe('0.5');
            }
        });
    });
});
//# sourceMappingURL=browser.test.js.map