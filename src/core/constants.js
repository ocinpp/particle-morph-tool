/**
 * Particle Morph Tool - Constants and Default Values
 */

// Particle system configuration
export const PARTICLE_COUNT = 100000;

// Maximum delay for particle stagger effect (30% of progress)
export const MAX_DELAY = 0.3;

// Default animation values
export const DEFAULT_MORPH_SPEED = 0.012;
export const DEFAULT_PAUSE_DURATION = 120; // frames (2 seconds at 60fps)
export const DEFAULT_POINT_SIZE = 3.0;
export const DEFAULT_Z_DEPTH = 2.0;
export const DEFAULT_IMAGE_SCALE = 0.9;
export const DEFAULT_MOUSE_RADIUS = 150;
export const DEFAULT_MOUSE_STRENGTH = 3.0;

// Camera defaults
export const CAMERA_FOV = 75;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 2000;
export const CAMERA_Z_POSITION = 500;

// Performance settings
export const MOUSE_THROTTLE = 33; // ~30fps for mouse updates

// Canvas size defaults
export const DEFAULT_CANVAS_WIDTH_PERCENT = 100;
export const DEFAULT_CANVAS_HEIGHT_PERCENT = 100;

// Max dimension for image processing
export const MAX_IMAGE_DIMENSION = 1000;

// Default visual settings
export const defaultSettings = {
  // Animation
  loopMode: true,
  smoothColors: true,
  transitionMode: 0, // 0=default, 1=spiral, 2=explosion, 3=gravity
  easingMode: 0, // 0=ease-in-out, 1=linear, 2=ease-in, 3=ease-out, 4=bounce, 5=elastic
  morphSpeed: DEFAULT_MORPH_SPEED,
  pauseDuration: DEFAULT_PAUSE_DURATION,

  // Rotation
  autoRotate: false,
  rotateMode: 0, // 0=continuous, 1=oscillate, 2=morph-only
  rotateAxis: 'y', // 'x', 'y', 'z', 'xy', 'xyz'
  rotateSpeed: 0.5, // degrees per frame at base speed
  rotateRange: 180, // max rotation angle for oscillate mode
  rotatePivot: 0, // 0=center, 100=max offset

  // Visual FX
  useGrayscale: false,
  invertColors: false,
  additiveBlend: true,
  opacity: 100,
  brightness: 100,
  saturation: 100,
  hueShift: 0,

  // Particles
  pointSize: DEFAULT_POINT_SIZE,
  zDepth: DEFAULT_Z_DEPTH,

  // Canvas
  imageScale: DEFAULT_IMAGE_SCALE,
  canvasWidthPercent: DEFAULT_CANVAS_WIDTH_PERCENT,
  canvasHeightPercent: DEFAULT_CANVAS_HEIGHT_PERCENT,

  // Mouse interaction
  mouseMode: 0, // 0=off, 1=attract, 2=repel
  mouseRadius: DEFAULT_MOUSE_RADIUS,
  mouseStrength: DEFAULT_MOUSE_STRENGTH,

  // Other
  autoMode: false,
  showFPS: false,
};

// Preset configurations
export const presets = {
  default: {
    additive: true,
    brightness: 100,
    saturation: 100,
    opacity: 100,
    pointSize: 3.0,
    hue: 0,
    transition: 0,
  },
  neon: {
    additive: true,
    brightness: 150,
    saturation: 200,
    opacity: 80,
    pointSize: 2.5,
    hue: 280,
    transition: 1,
  },
  pastel: {
    additive: false,
    brightness: 120,
    saturation: 80,
    opacity: 150,
    pointSize: 4.0,
    hue: 30,
    transition: 2,
  },
  ghost: {
    additive: true,
    brightness: 80,
    saturation: 50,
    opacity: 40,
    pointSize: 5.0,
    hue: 180,
    transition: 3,
  },
  fire: {
    additive: true,
    brightness: 130,
    saturation: 150,
    opacity: 120,
    pointSize: 3.5,
    hue: 0,
    transition: 3,
  },
  ice: {
    additive: true,
    brightness: 110,
    saturation: 120,
    opacity: 90,
    pointSize: 3.0,
    hue: 200,
    transition: 1,
  },
};

// LocalStorage key
export const SETTINGS_STORAGE_KEY = 'particleMorphSettings';

// IndexedDB constants
export const IMAGE_DB_NAME = 'ParticleMorphImages';
export const IMAGE_DB_VERSION = 1;
export const IMAGE_STORE_NAME = 'images';
