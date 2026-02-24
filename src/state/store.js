/**
 * Centralized state management for the Particle Morph Tool
 */
import * as THREE from 'three';
import { defaultSettings, MAX_DELAY, PARTICLE_COUNT } from '../core/constants.js';

/**
 * Application state object
 */
export const state = {
  // Three.js objects
  scene: null,
  camera: null,
  renderer: null,
  particles: null,

  // Image management
  images: [], // Array of {pos, col, url, name, id}
  currentIndex: 0,

  // Animation state
  isPlaying: false,
  progress: 0,
  pauseCounter: 0,
  animationFrameId: null,

  // Settings (initialized from defaults)
  settings: { ...defaultSettings },

  // Performance tracking
  isTabVisible: true,
  needsRender: true,
  lastMouseUpdate: 0,
  rotationTime: 0,

  // FPS tracking
  lastFrameTime: 0,
  frameCount: 0,
  fps: 60,

  // Mouse state
  mouse: new THREE.Vector2(),
  mouseWorld: new THREE.Vector3(),
  mouseVector: new THREE.Vector3(),

  // Event handler references for cleanup
  boundHandlers: {
    resize: null,
    mouseMove: null,
    visibility: null,
    keydown: null,
    contextLost: null,
    contextRestored: null,
    dragHandlers: [],
    touchHandlers: [],
  },

  // Timeouts for cleanup
  timeouts: {
    save: null,
    touch: null,
    attract: null,
  },

  // Abort controller for image reprocessing
  reprocessAbortController: null,

  // IndexedDB reference
  imageDB: null,
  imageIdCounter: 0,

  // Reusable processing canvas
  processCanvas: null,
  processCtx: null,

  // Empty buffer for clearing particles
  emptyBuffer: new Float32Array(PARTICLE_COUNT * 3),
};

/**
 * Reset state to defaults
 */
export function resetState() {
  // Reset all settings to defaults
  state.settings = { ...defaultSettings };

  // Reset animation state
  state.isPlaying = false;
  state.progress = 0;
  state.pauseCounter = 0;
  state.rotationTime = 0;

  // Reset performance tracking
  state.needsRender = true;

  // Reset particles rotation
  if (state.particles) {
    state.particles.rotation.set(0, 0, 0);
    state.particles.position.x = 0;
    state.particles.position.y = 0;
  }
}

/**
 * Get current settings as a serializable object
 * @returns {Object} Settings object
 */
export function getSettings() {
  return { ...state.settings };
}

/**
 * Apply settings to state
 * @param {Object} settings - Settings object to apply
 */
export function applySettings(settings) {
  if (!settings) return;

  // Apply each setting if defined
  Object.keys(settings).forEach(key => {
    if (settings[key] !== undefined && key in state.settings) {
      state.settings[key] = settings[key];
    }
  });
}

/**
 * Initialize state with Three.js objects
 * @param {Object} objects - Three.js objects
 */
export function initializeState(objects) {
  if (objects.scene) state.scene = objects.scene;
  if (objects.camera) state.camera = objects.camera;
  if (objects.renderer) state.renderer = objects.renderer;
  if (objects.particles) state.particles = objects.particles;
}

/**
 * Initialize the processing canvas
 */
export function initializeProcessCanvas() {
  if (!state.processCanvas) {
    state.processCanvas = document.createElement('canvas');
    state.processCtx = state.processCanvas.getContext('2d');
  }
}

// Re-export MAX_DELAY for use in other modules
export { MAX_DELAY };
