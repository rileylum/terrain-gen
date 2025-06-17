/**
 * @jest-environment jsdom
 */
import { TERRAIN_CONFIG, getTerrain } from '../image';
describe('Terrain Functionality', () => {
    describe('getTerrain', () => {
        it('should return correct terrain color for each elevation range', () => {
            // Test deep water
            expect(getTerrain(-0.8)).toEqual({ R: 30, G: 58, B: 138, A: 255 });
            expect(getTerrain(-0.1)).toEqual({ R: 30, G: 58, B: 138, A: 255 });
            // Test shallow water
            expect(getTerrain(0.05)).toEqual({ R: 59, G: 130, B: 246, A: 255 });
            expect(getTerrain(0.08)).toEqual({ R: 59, G: 130, B: 246, A: 255 });
            // Test beach
            expect(getTerrain(0.12)).toEqual({ R: 251, G: 191, B: 36, A: 255 });
            expect(getTerrain(0.14)).toEqual({ R: 251, G: 191, B: 36, A: 255 });
            // Test grassland
            expect(getTerrain(0.2)).toEqual({ R: 22, G: 163, B: 74, A: 255 });
            expect(getTerrain(0.25)).toEqual({ R: 22, G: 163, B: 74, A: 255 });
            // Test hills
            expect(getTerrain(0.35)).toEqual({ R: 139, G: 69, B: 19, A: 255 });
            expect(getTerrain(0.38)).toEqual({ R: 139, G: 69, B: 19, A: 255 });
            // Test mountain
            expect(getTerrain(0.5)).toEqual({ R: 243, G: 244, B: 246, A: 255 });
            expect(getTerrain(0.8)).toEqual({ R: 243, G: 244, B: 246, A: 255 });
        });
        it('should handle edge cases correctly', () => {
            // Test exact boundary values - note that 0.0 matches deep water first due to iteration order
            expect(getTerrain(0.0)).toEqual({ R: 30, G: 58, B: 138, A: 255 }); // Deep water (maxElevation: 0.0)
            expect(getTerrain(0.1)).toEqual({ R: 59, G: 130, B: 246, A: 255 }); // Shallow water (maxElevation: 0.1)
            expect(getTerrain(0.15)).toEqual({ R: 251, G: 191, B: 36, A: 255 }); // Beach (maxElevation: 0.15)
            expect(getTerrain(0.3)).toEqual({ R: 22, G: 163, B: 74, A: 255 }); // Grassland (maxElevation: 0.3)
            expect(getTerrain(0.4)).toEqual({ R: 139, G: 69, B: 19, A: 255 }); // Hills (maxElevation: 0.4)
        });
        it('should fallback to grassland for out-of-range values', () => {
            const grasslandColor = { R: 22, G: 163, B: 74, A: 255 };
            expect(getTerrain(2.0)).toEqual(grasslandColor);
            expect(getTerrain(-2.0)).toEqual(grasslandColor);
        });
        it('should work with custom terrain config', () => {
            const customConfig = {
                CUSTOM_TERRAIN: {
                    minElevation: -1.0,
                    maxElevation: 1.0,
                    color: { R: 255, G: 0, B: 0, A: 255 },
                },
            };
            expect(getTerrain(0.5, customConfig)).toEqual({
                R: 255,
                G: 0,
                B: 0,
                A: 255,
            });
        });
    });
    describe('TERRAIN_CONFIG', () => {
        it('should have correct terrain configuration structure', () => {
            expect(TERRAIN_CONFIG).toBeDefined();
            expect(Object.keys(TERRAIN_CONFIG)).toEqual([
                'DEEP_WATER',
                'SHALLOW_WATER',
                'BEACH',
                'GRASSLAND',
                'HILLS',
                'MOUNTAIN',
            ]);
        });
        it('should have proper elevation ranges', () => {
            const terrains = Object.values(TERRAIN_CONFIG);
            // Check that each terrain has proper min/max elevations
            terrains.forEach((terrain) => {
                expect(terrain.minElevation).toBeLessThanOrEqual(terrain.maxElevation);
                expect(terrain.minElevation).toBeGreaterThanOrEqual(-1.0);
                expect(terrain.maxElevation).toBeLessThanOrEqual(1.0);
            });
        });
        it('should have valid RGBA color values', () => {
            const terrains = Object.values(TERRAIN_CONFIG);
            terrains.forEach((terrain) => {
                expect(terrain.color.R).toBeGreaterThanOrEqual(0);
                expect(terrain.color.R).toBeLessThanOrEqual(255);
                expect(terrain.color.G).toBeGreaterThanOrEqual(0);
                expect(terrain.color.G).toBeLessThanOrEqual(255);
                expect(terrain.color.B).toBeGreaterThanOrEqual(0);
                expect(terrain.color.B).toBeLessThanOrEqual(255);
                expect(terrain.color.A).toBe(255);
            });
        });
        it('should have continuous elevation coverage', () => {
            const sortedTerrains = Object.entries(TERRAIN_CONFIG).sort((a, b) => a[1].maxElevation - b[1].maxElevation);
            expect(sortedTerrains[0][1].minElevation).toBe(-1.0);
            expect(sortedTerrains[sortedTerrains.length - 1][1].maxElevation).toBe(1.0);
            // Check that each terrain starts where the previous one ended
            for (let i = 1; i < sortedTerrains.length; i++) {
                const prevTerrain = sortedTerrains[i - 1][1];
                const currentTerrain = sortedTerrains[i][1];
                expect(currentTerrain.minElevation).toBe(prevTerrain.maxElevation);
            }
        });
    });
    describe('Terrain Types', () => {
        it('should have correct terrain type definitions', () => {
            // Test that terrain types have the expected structure
            const sampleTerrain = {
                minElevation: -1.0,
                maxElevation: 0.0,
                color: { R: 30, G: 58, B: 138, A: 255 },
            };
            expect(sampleTerrain.minElevation).toBeDefined();
            expect(sampleTerrain.maxElevation).toBeDefined();
            expect(sampleTerrain.color).toBeDefined();
            expect(sampleTerrain.color.R).toBeDefined();
            expect(sampleTerrain.color.G).toBeDefined();
            expect(sampleTerrain.color.B).toBeDefined();
            expect(sampleTerrain.color.A).toBeDefined();
        });
        it('should have correct RGBA value structure', () => {
            const sampleColor = { R: 255, G: 128, B: 64, A: 255 };
            expect(typeof sampleColor.R).toBe('number');
            expect(typeof sampleColor.G).toBe('number');
            expect(typeof sampleColor.B).toBe('number');
            expect(typeof sampleColor.A).toBe('number');
        });
    });
});
//# sourceMappingURL=terrain.test.js.map