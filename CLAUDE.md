# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server on localhost:8000 for web interface
- `npm start` - Compile TypeScript and generate PNG via CLI tool
- `npm test` - Run test suite (requires 90% coverage threshold)
- `npm run test:coverage` - Run tests with detailed coverage report
- `npm run format` - Format TypeScript, HTML, and CSS files
- `npm run format:check` - Check code formatting without changes

### Testing
- Tests are located in `src/__tests__/` directory
- Test files follow pattern `*.test.ts`
- Coverage threshold: 90% for branches, functions, lines, and statements
- Use `npm run test:watch` for development testing

## Architecture Overview

### Core Components
- **Perlin Noise Engine** (`src/perlin.ts`) - Pure TypeScript implementation of Perlin noise algorithm from scratch
- **CLI Tool** (`src/index.ts`) - PNG generation using Sharp library
- **Web Interface** (`src/browser.ts`) - Interactive terrain generator with Canvas rendering
- **Type System** (`src/types.ts`) - Comprehensive TypeScript definitions for all data structures

### Dual Interface Design
The project has two main interfaces:
1. **Web Interface**: Real-time interactive terrain generation in browser with parameter controls
2. **CLI Tool**: Command-line PNG export using Sharp for high-quality image generation

### Key Technical Details
- TypeScript compiled to ES2020 modules in `dist/` directory
- Web interface serves compiled JavaScript as ES modules from `public/index.html`
- Development server (`dev-server.js`) uses Express to properly serve ES modules
- All code uses strict TypeScript typing with custom type definitions
- Canvas API used for real-time browser rendering
- Sharp library used for high-quality PNG generation in CLI

### Noise Generation Algorithm
The Perlin noise implementation is built from scratch with these key functions:
- `createPerlinNoise(size, scale)` - Main generation function
- `sampleNoise(coordinate, vectorGrid)` - Sample noise at specific coordinates  
- `createVectorGrid(gridSize)` - Generate gradient vector grid
- `noiseToPixel(noiseValue)` - Convert noise values [-1,1] to pixels [0,255]

### Parameter Ranges
- **imageSize**: 64-1024px (web interface uses slider)
- **scaleFactor**: 0.01-0.3 (controls noise frequency/zoom level)

## Code Quality Standards
- Prettier formatting enforced via husky git hooks
- All staged TypeScript files automatically formatted on commit
- Jest tests run on related files during commit via lint-staged
- 90% test coverage requirement across all metrics