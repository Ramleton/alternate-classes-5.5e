interface Filter {
  filterType: string;
  filterId: string;
  color?: number;
  density?: number;
  time?: number;
  dimX?: number;
  dimY?: number;
  sepia?: number;
  noise?: number;
  noiseSize?: number;
  scratch?: number;
  scratchDensity?: number;
  scratchWidth?: number;
  vignetting?: number;
  vignettingAlpha?: number;
  vignettingBlur?: number;
  thickness?: number;
  zOrder?: number;
  animated?: {
    time?: {
      active: boolean;
      speed: number;
      animType: 'move' | unknown;
    };
    seed?: {
      active: boolean;
      animType: 'randomNumber' | unknown;
      val1: number;
      val2: number;
    };
    vignetting?: {
      active: boolean;
      animType: 'syncCosOscillation' | unknown;
      loopDuration: number;
      val1: number;
      val2: number;
    };
  };
};

export default interface TokenMagic {
  addFilters(tokenObject: unknown, filters: Filter[]): Promise<void>;
};
