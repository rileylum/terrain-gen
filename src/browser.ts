import { createPerlinNoise } from './perlin.js';

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
}

// Browser-specific terrain generation logic
export function initializeTerrainGenerator() {
  drawPlaceholder();
  setupRangeInputs();
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

  // Convert grayscale to RGBA
  for (let i = 0; i < imageBuffer.length; i++) {
    const pixelIndex = i * 4;
    imageData.data[pixelIndex] = imageBuffer[i]; // R
    imageData.data[pixelIndex + 1] = imageBuffer[i]; // G
    imageData.data[pixelIndex + 2] = imageBuffer[i]; // B
    imageData.data[pixelIndex + 3] = 255; // A
  }

  ctx.putImageData(imageData, 0, 0);
}

// Add your form handling and canvas drawing logic
function handleFormSubmit(evt: SubmitEvent) {
  evt.preventDefault();
  const formData = new FormData(evt.target as HTMLFormElement);
  const imageSize = formData.get('image_size_range') as string;
  const scaleFactor = formData.get('scale_factor_range') as string;

  const imageSizeValue = Math.pow(2, parseInt(imageSize));
  const scaleFactorValue = parseFloat(scaleFactor);

  const imageBuffer = createPerlinNoise(imageSizeValue, scaleFactorValue);
  renderToCanvas(imageBuffer, imageSizeValue);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const imageForm = document.getElementById('image_creation_form');
  imageForm?.addEventListener('submit', handleFormSubmit);

  initializeTerrainGenerator();
});
