# Terrain Generator for D&D

A TypeScript implementation of Perlin noise for procedural terrain generation, designed for creating D&D campaign maps and learning noise generation algorithms.

![Example Output](example-output.png)

## Overview

This project implements Perlin noise from scratch to generate realistic terrain patterns. Perlin noise works by:

1. **Creating a grid of random gradient vectors** - Each grid point has a random direction vector
2. **Calculating dot products** - For any sample point, compute how aligned it is with surrounding gradients  
3. **Interpolating values** - Smoothly blend the dot products to create continuous, natural-looking noise

The result is organic, flowing patterns perfect for terrain generation rather than harsh random noise.

## Features

- ✅ Pure TypeScript Perlin noise implementation
- ✅ Configurable image size and noise scale
- ✅ PNG output for visualization

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd terrain-gen

# Install dependencies
npm install

# Compile TypeScript
npx tsc

# Run the generator
node dist/index.js
```

## Dependencies

- **sharp**: High-performance image processing for PNG generation
- **@types/sharp**: TypeScript definitions for Sharp
- **typescript**: TypeScript compiler

## Usage

### Basic Generation

The main entry point generates a 256x256 noise map:

```typescript
import { createPerlinNoise } from './perlin';

const imageSize = 256;
const scaleFactor = 0.1; // Controls noise frequency
const imageBuffer = createPerlinNoise(imageSize, scaleFactor);
```

### Configuration

- **imageSize**: Output image dimensions (e.g., 256, 512, 1024)
- **scaleFactor**: Noise frequency - smaller values = larger features, larger values = more detail

### Key Functions

- `createPerlinNoise(size, scale)`: Main function to generate noise
- `sampleNoise(coordinate, vectorGrid)`: Sample noise at specific coordinates
- `createVectorGrid(gridSize)`: Generate the gradient vector grid
- `noiseToPixel(noiseValue)`: Convert noise values [-1,1] to pixel values [0,255]

## Project Structure

```
src/
├── index.ts          # Main execution and Sharp integration
├── perlin.ts         # Core Perlin noise implementation
├── types.ts          # TypeScript type definitions
└── dist/             # Compiled JavaScript (generated)
```

## Roadmap

### Phase 1: User Interface
- [ ] **Web Frontend** - Browser-based terrain generator
- [ ] **Parameter Controls** - Sliders and inputs for all generation settings

### Phase 2: Enhanced Noise Generation
- [ ] **Octave Layering** - Combine multiple noise layers for realistic terrain
- [ ] **Fractal Noise** - Add detail at multiple scales
- [ ] **Noise Variants** - Implement Simplex noise and other algorithms

### Phase 3: Terrain Features
- [ ] **Height Thresholding** - Convert noise to terrain types (water, plains, hills, mountains)
- [ ] **Biome Generation** - Use temperature/moisture maps for biome placement
- [ ] **River Generation** - Hydraulic erosion and water flow simulation
- [ ] **Settlement Placement** - Algorithmic city and town positioning

### Phase 4: D&D Integration
- [ ] **Hex Grid Conversion** - Convert square grid to hexagonal for D&D maps
- [ ] **Scale Configuration** - Support for different map scales (regional, local, battle)
- [ ] **Encounter Zones** - Generate encounter difficulty based on terrain
- [ ] **Resource Distribution** - Place natural resources and points of interest

### Phase 5: Visualization & Export
- [ ] **Color Mapping** - Realistic terrain colors and elevation shading
- [ ] **Contour Lines** - Topographic map generation
- [ ] **Multiple Export Formats** - SVG, GeoJSON, Roll20 integration
- [ ] **Interactive Preview** - Real-time parameter adjustment

### Phase 6: Extending User Interface
- [ ] **Preset Templates** - Common terrain types and D&D scenarios
- [ ] **Batch Generation** - Generate multiple map variations


## Contributing

This is primarily a learning project, but contributions are welcome! Areas of interest:

- Algorithm optimizations
- Additional noise types
- D&D-specific features
- Documentation improvements
- Hard critique 

## License

MIT License - feel free to use this for your campaigns!
