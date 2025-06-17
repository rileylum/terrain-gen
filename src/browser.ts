import { createFractalNoise } from './fractal.js';
import { createImageBuffer, TERRAIN_CONFIG } from './image.js';
import { TerrainConfig } from './types.js';

// Draw placeholder on canvas
function drawPlaceholder() {
  const canvas = document.getElementById('terrain-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = canvas;

  // Draw placeholder background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);

  // Draw placeholder text
  ctx.fillStyle = '#666';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Placeholder until image is generated', width / 2, height / 2);
}

// Terrain configuration management
let currentTerrainConfig: TerrainConfig = { ...TERRAIN_CONFIG };
let terrainCounter = 0;

function updateTerrainRanges() {
  // Sort terrain types by max elevation
  const sortedTerrain = Object.entries(currentTerrainConfig).sort(
    (a, b) => a[1].maxElevation - b[1].maxElevation
  );

  // Update min elevations based on previous terrain's max elevation
  for (let i = 0; i < sortedTerrain.length; i++) {
    const [terrainKey, terrain] = sortedTerrain[i];

    if (i === 0) {
      // First terrain starts at -1.0
      currentTerrainConfig[terrainKey].minElevation = -1.0;
    } else {
      // Each terrain starts where the previous one ended
      const previousMax = sortedTerrain[i - 1][1].maxElevation;
      currentTerrainConfig[terrainKey].minElevation = previousMax;
    }
  }

  // Update UI to match sorted order
  sortTerrainUIElements();

  // Validate terrain configuration
  validateTerrainConfig();
}

function validateTerrainConfig() {
  const generateBtn = document.querySelector(
    '.generate-btn'
  ) as HTMLButtonElement;

  // Check for duplicate max elevations
  const maxElevations = Object.values(currentTerrainConfig).map(
    (t) => t.maxElevation
  );
  const duplicates = maxElevations.filter(
    (value, index) => maxElevations.indexOf(value) !== index
  );

  if (duplicates.length > 0) {
    // Disable generate button
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.textContent = 'Fix Terrain Configuration';
    }

    // Highlight problematic inputs with tooltip
    highlightDuplicateElevations(duplicates[0]);
  } else {
    // Enable generate button
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate Terrain';
    }

    // Remove highlights
    clearElevationHighlights();
  }
}

function highlightDuplicateElevations(duplicateValue: number) {
  const terrainElements = document.querySelectorAll('.terrain-type');
  terrainElements.forEach((element) => {
    const terrainKey = (element as HTMLElement).dataset.terrainName!;
    const maxElevation = currentTerrainConfig[terrainKey]?.maxElevation;
    const maxInput = element.querySelector(
      '.max-elevation'
    ) as HTMLInputElement;

    if (maxElevation === duplicateValue && maxInput) {
      maxInput.classList.add('error');
      maxInput.title = `⚠️ Duplicate elevation value (${duplicateValue.toFixed(2)}). Please adjust to create unique terrain ranges.`;
    } else if (maxInput) {
      maxInput.classList.remove('error');
      maxInput.title = '';
    }
  });
}

function clearElevationHighlights() {
  const elevationInputs = document.querySelectorAll('.max-elevation');
  elevationInputs.forEach((input) => {
    (input as HTMLInputElement).classList.remove('error');
    (input as HTMLInputElement).title = '';
  });
}

function sortTerrainUIElements() {
  const container = document.getElementById('terrain-types-container');
  if (!container) return;

  // Get all terrain elements with their max elevation values
  const terrainElements = Array.from(container.children) as HTMLElement[];

  // Sort elements by their terrain's max elevation
  terrainElements.sort((a, b) => {
    const aKey = a.dataset.terrainName!;
    const bKey = b.dataset.terrainName!;
    const aMaxElevation = currentTerrainConfig[aKey]?.maxElevation || 0;
    const bMaxElevation = currentTerrainConfig[bKey]?.maxElevation || 0;
    return aMaxElevation - bMaxElevation;
  });

  // Re-append elements in sorted order and update range indicators
  terrainElements.forEach((element, index) => {
    container.appendChild(element);
    updateElevationRangeIndicators(element, index, terrainElements.length);
  });
}

// Estimate coverage percentage based on normal distribution of Perlin noise
function estimateNoiseDistribution(minValue: number, maxValue: number): number {
  // Perlin noise roughly follows a normal distribution centered at 0
  // with most values concentrated between -0.5 and 0.5

  // Approximate cumulative distribution function for Perlin noise
  function normalCDF(x: number): number {
    // Simplified approximation of normal CDF for Perlin noise distribution
    // Based on observed data: most values fall within [-0.5, 0.5]
    const mean = 0;
    const stdDev = 0.25; // Approximated from actual noise distribution

    // Clamp extreme values
    if (x <= -1) return 0;
    if (x >= 1) return 1;

    // Simple sigmoid approximation for the CDF
    const z = (x - mean) / stdDev;
    return 1 / (1 + Math.exp(-z * 1.2));
  }

  const minCDF = normalCDF(minValue);
  const maxCDF = normalCDF(maxValue);

  return (maxCDF - minCDF) * 100;
}

function updateElevationRangeIndicators(
  element: HTMLElement,
  index: number,
  totalCount: number
) {
  const terrainKey = element.dataset.terrainName!;
  const terrain = currentTerrainConfig[terrainKey];
  if (!terrain) return;

  const elevationGroup = element.querySelector('.elevation-group');
  if (!elevationGroup) return;

  // Remove existing range indicator
  const existingIndicator = elevationGroup.querySelector(
    '.elevation-range-indicator'
  );
  if (existingIndicator) {
    existingIndicator.remove();
  }

  // Calculate range and estimated coverage percentage
  let minValue: number, maxValue: number;

  if (index === 0) {
    minValue = -1.0;
    maxValue = terrain.maxElevation;
  } else if (index === totalCount - 1) {
    minValue = terrain.minElevation;
    maxValue = 1.0;
  } else {
    minValue = terrain.minElevation;
    maxValue = terrain.maxElevation;
  }

  const estimatedCoverage = estimateNoiseDistribution(minValue, maxValue);

  // Create range indicator
  const indicator = document.createElement('small');
  indicator.className = 'elevation-range-indicator';

  if (index === 0) {
    indicator.textContent = `Range: -1.0 to ${maxValue.toFixed(2)} (~${estimatedCoverage.toFixed(1)}%)`;
  } else if (index === totalCount - 1) {
    indicator.textContent = `Range: ${minValue.toFixed(2)} to 1.0 (~${estimatedCoverage.toFixed(1)}%)`;
  } else {
    indicator.textContent = `Range: ${minValue.toFixed(2)} to ${maxValue.toFixed(2)} (~${estimatedCoverage.toFixed(1)}%)`;
  }

  elevationGroup.appendChild(indicator);
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function createTerrainEditor(
  name: string,
  terrainKey: string,
  minElevation: number,
  maxElevation: number,
  color: { R: number; G: number; B: number; A: number }
): HTMLElement {
  const terrainId = `terrain_${terrainCounter++}`;
  const colorHex = rgbToHex(color.R, color.G, color.B);

  const div = document.createElement('div');
  div.className = 'terrain-type';
  div.dataset.terrainName = terrainKey;

  div.innerHTML = `
    <div class="terrain-details">
      <div class="terrain-name-group">
        <label>Terrain Name:</label>
        <div class="name-input-group">
          <input type="text" class="terrain-name" value="${name}" />
          <button type="button" class="remove-btn">×</button>
        </div>
      </div>
      <div class="color-group">
        <label>Color:</label>
        <div class="color-input-group">
          <input type="color" class="terrain-color" value="${colorHex}" />
          <input type="text" class="terrain-hex" value="${colorHex}" />
        </div>
      </div>
      <div class="elevation-group">
        <label>Max Elevation:</label>
        <div class="elevation-inputs">
          <input type="number" class="max-elevation" value="${maxElevation}" step="0.01" min="-1" max="1" />
        </div>
      </div>
    </div>
  `;

  // Event listeners
  const removeBtn = div.querySelector('.remove-btn') as HTMLButtonElement;
  const nameInput = div.querySelector('.terrain-name') as HTMLInputElement;
  const colorInput = div.querySelector('.terrain-color') as HTMLInputElement;
  const hexInput = div.querySelector('.terrain-hex') as HTMLInputElement;
  const maxInput = div.querySelector('.max-elevation') as HTMLInputElement;

  removeBtn.addEventListener('click', () => {
    delete currentTerrainConfig[div.dataset.terrainName!];
    div.remove();
    updateTerrainRanges();
  });

  nameInput.addEventListener('input', () => {
    const oldName = div.dataset.terrainName!;
    const newName = nameInput.value.toUpperCase().replace(/\s+/g, '_');
    if (oldName !== newName && newName) {
      currentTerrainConfig[newName] = currentTerrainConfig[oldName];
      delete currentTerrainConfig[oldName];
      div.dataset.terrainName = newName;
    }
  });

  colorInput.addEventListener('input', () => {
    hexInput.value = colorInput.value;
    updateTerrainColor();
  });

  hexInput.addEventListener('input', () => {
    colorInput.value = hexInput.value;
    updateTerrainColor();
  });

  function updateTerrainColor() {
    const rgb = hexToRgb(colorInput.value);
    const terrainName = div.dataset.terrainName!;
    if (currentTerrainConfig[terrainName]) {
      currentTerrainConfig[terrainName].color = {
        R: rgb.r,
        G: rgb.g,
        B: rgb.b,
        A: 255,
      };
    }
  }

  function updateElevation() {
    const terrainName = div.dataset.terrainName!;
    if (currentTerrainConfig[terrainName]) {
      currentTerrainConfig[terrainName].maxElevation = parseFloat(
        maxInput.value
      );
      updateTerrainRanges();
    }
  }

  maxInput.addEventListener('input', updateElevation);

  return div;
}

function setupTerrainEditor() {
  const container = document.getElementById('terrain-types-container');
  const addBtn = document.getElementById('add-terrain-btn');
  const resetBtn = document.getElementById('reset-terrain-btn');

  if (!container || !addBtn || !resetBtn) {
    console.warn('Terrain editor elements not found, skipping setup');
    return;
  }

  // Initialize with default terrain types
  function loadDefaultTerrain() {
    container.innerHTML = '';
    currentTerrainConfig = { ...TERRAIN_CONFIG };
    terrainCounter = 0;

    Object.entries(TERRAIN_CONFIG).forEach(([terrainKey, config]) => {
      const displayName = terrainKey.toLowerCase().replace(/_/g, ' ');
      const editor = createTerrainEditor(
        displayName,
        terrainKey,
        config.minElevation,
        config.maxElevation,
        config.color
      );
      container.appendChild(editor);
    });
  }

  addBtn.addEventListener('click', () => {
    const newName = `New Terrain ${terrainCounter}`;
    const terrainKey = newName.toUpperCase().replace(/\s+/g, '_');

    currentTerrainConfig[terrainKey] = {
      minElevation: 0,
      maxElevation: 0.1,
      color: { R: 128, G: 128, B: 128, A: 255 },
    };

    const editor = createTerrainEditor(newName, terrainKey, 0, 0.1, {
      R: 128,
      G: 128,
      B: 128,
      A: 255,
    });
    container.appendChild(editor);
    updateTerrainRanges();
  });

  resetBtn.addEventListener('click', loadDefaultTerrain);

  loadDefaultTerrain();
  updateTerrainRanges();
}

// Update output displays when range inputs change
function setupRangeInputs() {
  const imageSizeRange = document.getElementById(
    'image_size_range'
  ) as HTMLInputElement;
  const imageSizeDisplay = document.getElementById(
    'image_size_display'
  ) as HTMLOutputElement;
  const scaleFactorRange = document.getElementById(
    'scale_factor_range'
  ) as HTMLInputElement;
  const scaleFactorDisplay = document.getElementById(
    'scale_factor_display'
  ) as HTMLOutputElement;
  const octaveCountRange = document.getElementById(
    'octave_count_range'
  ) as HTMLInputElement;
  const octaveCountDisplay = document.getElementById(
    'octave_count_display'
  ) as HTMLOutputElement;

  if (imageSizeRange && imageSizeDisplay) {
    imageSizeRange.addEventListener('input', () => {
      imageSizeDisplay.value = Math.pow(
        2,
        parseInt(imageSizeRange.value)
      ).toString();
    });
  }

  if (scaleFactorRange && scaleFactorDisplay) {
    scaleFactorRange.addEventListener('input', () => {
      scaleFactorDisplay.value = parseFloat(scaleFactorRange.value).toFixed(2);
    });
  }

  if (octaveCountRange && octaveCountDisplay) {
    octaveCountRange.addEventListener('input', () => {
      octaveCountDisplay.value = octaveCountRange.value;
    });
  }

  // Terrain editor is now handled separately
}

// Setup tab functionality
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Remove active class from all buttons and panels
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabPanels.forEach((panel) => panel.classList.remove('active'));

      // Add active class to clicked button and corresponding panel
      button.classList.add('active');
      const targetPanel = document.getElementById(targetTab);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

// Browser-specific terrain generation logic
export function initializeTerrainGenerator() {
  drawPlaceholder();
  setupRangeInputs();
  setupTabs();
  setupTerrainEditor();
}

// Render image buffer to canvas
function renderToCanvas(imageBuffer: Uint8Array, imageSize: number) {
  const canvas = document.getElementById('terrain-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size to match image
  canvas.width = imageSize;
  canvas.height = imageSize;

  // Create ImageData
  const imageData = ctx.createImageData(imageSize, imageSize);

  // Copy RGBA data directly from buffer
  imageData.data.set(imageBuffer);

  ctx.putImageData(imageData, 0, 0);
}

// Add your form handling and canvas drawing logic
function handleFormSubmit(evt: SubmitEvent) {
  evt.preventDefault();
  const formData = new FormData(evt.target as HTMLFormElement);
  const imageSize = formData.get('image_size_range') as string;
  const scaleFactor = formData.get('scale_factor_range') as string;
  const octaveCount = formData.get('octave_count_range') as string;

  const imageSizeValue = Math.pow(2, parseInt(imageSize));
  const scaleFactorValue = parseFloat(scaleFactor);
  const octaveCountValue = parseInt(octaveCount);
  const noiseArray = createFractalNoise(
    octaveCountValue,
    imageSizeValue,
    scaleFactorValue
  );
  const imageBuffer = createImageBuffer(
    imageSizeValue,
    noiseArray,
    currentTerrainConfig
  );
  renderToCanvas(imageBuffer, imageSizeValue);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const imageForm = document.getElementById('image_creation_form');
  imageForm?.addEventListener('submit', handleFormSubmit);

  initializeTerrainGenerator();
});
