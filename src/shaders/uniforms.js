/**
 * Shader uniform definitions
 */
import * as THREE from 'three';
import { DEFAULT_POINT_SIZE, DEFAULT_MOUSE_RADIUS, DEFAULT_MOUSE_STRENGTH } from '../core/constants.js';

/**
 * Creates default uniform values for the particle shader
 * @returns {Object} Uniform definitions for ShaderMaterial
 */
export function createUniforms() {
  return {
    uProgress: { value: 0.0 },
    uTime: { value: 0.0 },
    uSmoothColors: { value: 1.0 },
    uGrayscale: { value: 0.0 },
    uTransitionMode: { value: 0.0 },
    uEasingMode: { value: 0.0 },
    uPointSize: { value: DEFAULT_POINT_SIZE },
    uOpacity: { value: 1.0 },
    uBrightness: { value: 1.0 },
    uSaturation: { value: 1.0 },
    uHueShift: { value: 0.0 },
    uInvert: { value: 0.0 },
    uMouse: { value: new THREE.Vector3() },
    uMouseMode: { value: 0.0 },
    uMouseRadius: { value: DEFAULT_MOUSE_RADIUS },
    uMouseStrength: { value: DEFAULT_MOUSE_STRENGTH },
  };
}

/**
 * Updates uniforms from a settings object
 * @param {Object} uniforms - The uniforms object from ShaderMaterial
 * @param {Object} settings - Settings object with values to apply
 */
export function updateUniformsFromSettings(uniforms, settings) {
  if (!uniforms || !settings) return;

  if (settings.useGrayscale !== undefined) {
    uniforms.uGrayscale.value = settings.useGrayscale ? 1.0 : 0.0;
  }
  if (settings.invertColors !== undefined) {
    uniforms.uInvert.value = settings.invertColors ? 1.0 : 0.0;
  }
  if (settings.smoothColors !== undefined) {
    uniforms.uSmoothColors.value = settings.smoothColors ? 1.0 : 0.0;
  }
  if (settings.transitionMode !== undefined) {
    uniforms.uTransitionMode.value = settings.transitionMode;
  }
  if (settings.easingMode !== undefined) {
    uniforms.uEasingMode.value = settings.easingMode;
  }
  if (settings.pointSize !== undefined) {
    uniforms.uPointSize.value = settings.pointSize;
  }
  if (settings.opacity !== undefined) {
    uniforms.uOpacity.value = settings.opacity / 100;
  }
  if (settings.brightness !== undefined) {
    uniforms.uBrightness.value = settings.brightness / 100;
  }
  if (settings.saturation !== undefined) {
    uniforms.uSaturation.value = settings.saturation / 100;
  }
  if (settings.hueShift !== undefined) {
    uniforms.uHueShift.value = settings.hueShift;
  }
  if (settings.mouseMode !== undefined) {
    uniforms.uMouseMode.value = settings.mouseMode;
  }
  if (settings.mouseRadius !== undefined) {
    uniforms.uMouseRadius.value = settings.mouseRadius;
  }
  if (settings.mouseStrength !== undefined) {
    uniforms.uMouseStrength.value = settings.mouseStrength;
  }
}
