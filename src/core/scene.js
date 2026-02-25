/**
 * Three.js scene setup and management
 */
import * as THREE from 'three';
import {
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_FAR,
  CAMERA_Z_POSITION,
} from './constants.js';
import { state } from '../state/store.js';

/**
 * Initialize the Three.js scene
 * @param {HTMLElement} container - Container element for the canvas
 * @returns {Object} Scene, camera, and renderer
 */
export function createScene(container) {
  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  // Create camera
  const camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    CAMERA_NEAR,
    CAMERA_FAR
  );
  camera.position.z = CAMERA_Z_POSITION;

  // Create renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Add canvas to container
  container.appendChild(renderer.domElement);

  // Store references in state
  state.scene = scene;
  state.camera = camera;
  state.renderer = renderer;

  return { scene, camera, renderer };
}

/**
 * Update canvas size based on percentage settings
 * @param {number} widthPercent - Width percentage (0-100)
 * @param {number} heightPercent - Height percentage (0-100)
 */
export function updateCanvasSize(widthPercent, heightPercent) {
  const { camera, renderer } = state;
  if (!camera || !renderer) return;

  const container = document.getElementById('canvas-container');
  if (!container) return;

  const width = window.innerWidth * (widthPercent / 100);
  const height = window.innerHeight * (heightPercent / 100);

  container.style.width = width + 'px';
  container.style.height = height + 'px';

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);

  state.needsRender = true;
}

/**
 * Handle window resize
 */
export function onWindowResize() {
  const { camera, renderer } = state;
  const settings = state.settings;

  if (!camera || !renderer) return;

  const width = window.innerWidth * (settings.canvasWidthPercent / 100);
  const height = window.innerHeight * (settings.canvasHeightPercent / 100);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

/**
 * Set background color
 * @param {string} hexColor - Hex color string (e.g., '#111111')
 */
export function setBackgroundColor(hexColor) {
  if (state.scene) {
    state.scene.background = new THREE.Color(hexColor);
    document.body.style.background = hexColor;
    state.needsRender = true;
  }
}

/**
 * Dispose of Three.js resources
 */
export function disposeScene() {
  if (state.particles) {
    state.scene.remove(state.particles);
    state.particles.geometry.dispose();
    state.particles.material.dispose();
    state.particles = null;
  }

  if (state.renderer) {
    state.renderer.dispose();
    state.renderer.forceContextLoss();
  }
}
