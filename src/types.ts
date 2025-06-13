export type Coordinate = {x: number; y:number};
export type ImageSize = number;
export type NoiseValue = number; //[-1, 1]
export type PixelValue = number; //[0, 255]
export type ScaleFactor = number;
export type GridSize = number;
export type InterpolationFactor = number; //[0,1]
export type GradientVector = { x: number; y: number};
export type GradientVectorGrid = GradientVector[][];
export type NoiseArray = NoiseValue[][];
export type ImageBuffer = Uint8Array;

