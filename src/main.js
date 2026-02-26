/**
 * Particle Morph Tool - Main Entry Point
 *
 * Modernized modular architecture with:
 * - Vite build system
 * - ES modules
 * - Three.js for WebGL rendering
 * - GLSL shader imports
 */
import * as THREE from 'three';
import './style.css';

// Core modules
import { defaultSettings } from './core/constants.js';
import { state, initializeProcessCanvas } from './state/store.js';
import { loadSettings, debouncedSaveSettings, clearDebouncedSaveTimeout } from './state/settings.js';

// Scene modules
import { createScene, updateCanvasSize, setBackgroundColor, disposeScene } from './core/scene.js';
import { createParticleSystem } from './core/particles.js';
import { animate, stopAnimation, togglePlayback } from './core/animation.js';

// Image modules
import { setupImageHandlers, addImageFromFile } from './image/manager.js';
import { openImageDB, loadImagesFromDB, closeImageDB } from './image/storage.js';

// UI modules
import { setupControls } from './ui/controls.js';
import { setupPresetHandlers } from './ui/presets.js';

// Interaction modules
import { setupMouseInteraction, removeMouseInteraction } from './interaction/mouse.js';
import { setupTouchInteraction, removeTouchInteraction } from './interaction/touch.js';
import { setupDragAndDrop, removeDragAndDrop } from './interaction/dragdrop.js';
import { setupKeyboardHandlers, removeKeyboardHandlers } from './interaction/keyboard.js';

/**
 * Initialize the application
 */
async function init() {
  console.log('Particle Morph Tool - Initializing...');

  // Initialize processing canvas
  initializeProcessCanvas();

  // Set up Three.js scene
  const container = document.getElementById('canvas-container');
  if (!container) {
    console.error('Canvas container not found');
    return;
  }

  createScene(container);

  // Create particle system
  createParticleSystem();

  // Load saved settings
  loadSettings();

  // Open IndexedDB and load saved images
  try {
    await openImageDB();
    await loadImagesFromDB(addImageFromFile);
  } catch (err) {
    console.warn('IndexedDB initialization failed:', err);
  }

  // Set up event handlers
  setupEventHandlers();

  // Set up UI controls
  setupControls();
  setupPresetHandlers();
  setupImageHandlers();

  // Set up interaction handlers
  setupMouseInteraction();
  setupTouchInteraction();
  setupDragAndDrop();
  setupKeyboardHandlers();

  // Set up auto-save on settings changes
  const uiPanel = document.getElementById('ui');
  if (uiPanel) {
    uiPanel.addEventListener('input', debouncedSaveSettings);
    uiPanel.addEventListener('change', debouncedSaveSettings);
  }

  // Start animation loop
  animate();

  // Update initial status
  updateStatus(state.images.length < 2 ? `Add ${2 - state.images.length} more image(s)` : 'Ready - Press Space');

  console.log('Particle Morph Tool - Initialized');
}

/**
 * Set up window and document event handlers
 */
function setupEventHandlers() {
  // Window resize
  const resizeHandler = () => {
    const { settings } = state;
    updateCanvasSize(settings.canvasWidthPercent, settings.canvasHeightPercent);
  };
  window.addEventListener('resize', resizeHandler);
  state.boundHandlers.resize = resizeHandler;

  // Visibility change (pause when tab hidden)
  const visibilityHandler = () => {
    state.isTabVisible = !document.hidden;
  };
  document.addEventListener('visibilitychange', visibilityHandler);
  state.boundHandlers.visibility = visibilityHandler;

  // WebGL context loss
  const contextLostHandler = (e) => {
    e.preventDefault();
    updateStatus('WebGL context lost - attempting recovery...');
    console.warn('WebGL context lost');
  };
  state.renderer.domElement.addEventListener('webglcontextlost', contextLostHandler);
  state.boundHandlers.contextLost = contextLostHandler;

  // WebGL context restore
  const contextRestoredHandler = () => {
    updateStatus('WebGL context restored');
    console.log('WebGL context restored');
    state.needsRender = true;
  };
  state.renderer.domElement.addEventListener('webglcontextrestored', contextRestoredHandler);
  state.boundHandlers.contextRestored = contextRestoredHandler;

  // Morph button click
  const morphBtn = document.getElementById('morphBtn');
  if (morphBtn) {
    morphBtn.addEventListener('click', togglePlayback);
  }

  // Screenshot button
  const screenshotBtn = document.getElementById('screenshotBtn');
  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', takeScreenshot);
  }

  // Reset button
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', confirmReset);
  }

  // Collapse/restore buttons
  const collapseBtn = document.getElementById('collapseBtn');
  const restoreBtn = document.getElementById('restoreBtn');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      document.getElementById('ui').classList.add('hidden');
      if (restoreBtn) restoreBtn.style.display = 'block';
    });
  }
  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      document.getElementById('ui').classList.remove('hidden');
      restoreBtn.style.display = 'none';
    });
  }

  // Background color picker
  const bgColorPicker = document.getElementById('bgColorPicker');
  if (bgColorPicker) {
    bgColorPicker.addEventListener('input', (e) => {
      setBackgroundColor(e.target.value);
    });
  }

  // Note: Accordion handlers are set up in setupControls() via setupAccordionHandlers()
}

/**
 * Take a screenshot
 */
function takeScreenshot() {
  state.renderer.render(state.scene, state.camera);

  state.renderer.domElement.toBlob((blob) => {
    if (!blob) {
      updateStatus('Screenshot failed!');
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'particle-morph-' + Date.now() + '.png';
    link.href = url;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 100);
    updateStatus('Screenshot saved!');
    setTimeout(() => updateStatus(state.isPlaying ? 'Playing...' : 'Ready'), 2000);
  }, 'image/png');
}

/**
 * Confirm and reset settings
 */
function confirmReset() {
  // eslint-disable-next-line no-undef
  if (confirm('Reset all settings to defaults?')) {
    resetAllSettings();
  }
}

/**
 * Reset all settings to defaults
 */
function resetAllSettings() {
  // Reset state settings
  Object.assign(state.settings, defaultSettings);

  // Update uniforms
  const uniforms = state.particles.material.uniforms;
  uniforms.uSmoothColors.value = 1.0;
  uniforms.uGrayscale.value = 0.0;
  uniforms.uInvert.value = 0.0;
  uniforms.uTransitionMode.value = 0;
  uniforms.uEasingMode.value = 0;
  uniforms.uPointSize.value = 3.0;
  uniforms.uOpacity.value = 1.0;
  uniforms.uBrightness.value = 1.0;
  uniforms.uSaturation.value = 1.0;
  uniforms.uHueShift.value = 0;
  uniforms.uMouseMode.value = 0;
  uniforms.uMouseRadius.value = 150;
  uniforms.uMouseStrength.value = 3.0;

  // Reset blend mode
  state.particles.material.blending = THREE.AdditiveBlending;
  const blendToggle = document.getElementById('blendToggle');
  if (blendToggle) blendToggle.checked = true;

  // Reset rotation
  state.particles.rotation.set(0, 0, 0);
  state.particles.position.x = 0;
  state.particles.position.y = 0;

  // Update UI elements
  updateAllUIElements();

  debouncedSaveSettings();
  updateStatus('Settings reset to defaults');
}

/**
 * Update all UI elements from state
 */
function updateAllUIElements() {
  const { settings } = state;

  // Animation controls
  const loopToggle = document.getElementById('loopToggle');
  if (loopToggle) loopToggle.checked = settings.loopMode;

  const colorToggle = document.getElementById('colorToggle');
  if (colorToggle) colorToggle.checked = settings.smoothColors;

  const transitionSelect = document.getElementById('transitionModeSelect');
  if (transitionSelect) transitionSelect.value = settings.transitionMode;

  const easingSelect = document.getElementById('easingModeSelect');
  if (easingSelect) easingSelect.value = settings.easingMode;

  const speedSlider = document.getElementById('speedSlider');
  if (speedSlider) speedSlider.value = settings.morphSpeed * 1000;

  const speedValue = document.getElementById('speedValue');
  if (speedValue) speedValue.textContent = (settings.morphSpeed / 0.012).toFixed(1) + 'x';

  const pauseSlider = document.getElementById('pauseSlider');
  if (pauseSlider) pauseSlider.value = settings.pauseDuration;

  const pauseValue = document.getElementById('pauseValue');
  if (pauseValue) pauseValue.textContent = (settings.pauseDuration / 60).toFixed(1) + 's';

  // Rotation controls
  const rotateToggle = document.getElementById('rotateToggle');
  if (rotateToggle) rotateToggle.checked = settings.autoRotate;

  const rotateModeSelect = document.getElementById('rotateModeSelect');
  if (rotateModeSelect) rotateModeSelect.value = settings.rotateMode;

  const rotateAxisSelect = document.getElementById('rotateAxisSelect');
  if (rotateAxisSelect) rotateAxisSelect.value = settings.rotateAxis;

  const rotateSpeedSlider = document.getElementById('rotateSpeedSlider');
  if (rotateSpeedSlider) rotateSpeedSlider.value = settings.rotateSpeed * 100;

  const rotateSpeedValue = document.getElementById('rotateSpeedValue');
  if (rotateSpeedValue) rotateSpeedValue.textContent = settings.rotateSpeed.toFixed(1) + '°/s';

  const rotateRangeSlider = document.getElementById('rotateRangeSlider');
  if (rotateRangeSlider) rotateRangeSlider.value = settings.rotateRange;

  const rotateRangeValue = document.getElementById('rotateRangeValue');
  if (rotateRangeValue) rotateRangeValue.textContent = '±' + settings.rotateRange + '°';

  const rotatePivotSlider = document.getElementById('rotatePivotSlider');
  if (rotatePivotSlider) rotatePivotSlider.value = settings.rotatePivot;

  const rotatePivotValue = document.getElementById('rotatePivotValue');
  if (rotatePivotValue) rotatePivotValue.textContent = settings.rotatePivot + '%';

  // Visual FX controls
  const grayToggle = document.getElementById('grayToggle');
  if (grayToggle) grayToggle.checked = settings.useGrayscale;

  const invertToggle = document.getElementById('invertToggle');
  if (invertToggle) invertToggle.checked = settings.invertColors;

  const blendToggle = document.getElementById('blendToggle');
  if (blendToggle) blendToggle.checked = settings.additiveBlend;

  const opacitySlider = document.getElementById('opacitySlider');
  if (opacitySlider) opacitySlider.value = settings.opacity;

  const opacityValue = document.getElementById('opacityValue');
  if (opacityValue) opacityValue.textContent = settings.opacity + '%';

  const brightnessSlider = document.getElementById('brightnessSlider');
  if (brightnessSlider) brightnessSlider.value = settings.brightness;

  const brightnessValue = document.getElementById('brightnessValue');
  if (brightnessValue) brightnessValue.textContent = settings.brightness + '%';

  const saturationSlider = document.getElementById('saturationSlider');
  if (saturationSlider) saturationSlider.value = settings.saturation;

  const saturationValue = document.getElementById('saturationValue');
  if (saturationValue) saturationValue.textContent = settings.saturation + '%';

  const hueSlider = document.getElementById('hueSlider');
  if (hueSlider) hueSlider.value = settings.hueShift * 360;

  const hueValue = document.getElementById('hueValue');
  if (hueValue) hueValue.textContent = Math.round(settings.hueShift * 360) + '°';

  // Particle controls
  const pointSizeSlider = document.getElementById('pointSizeSlider');
  if (pointSizeSlider) pointSizeSlider.value = settings.pointSize;

  const pointSizeValue = document.getElementById('pointSizeValue');
  if (pointSizeValue) pointSizeValue.textContent = settings.pointSize.toFixed(1);

  const zDepthSlider = document.getElementById('zDepthSlider');
  if (zDepthSlider) zDepthSlider.value = settings.zDepth;

  const zDepthValue = document.getElementById('zDepthValue');
  if (zDepthValue) zDepthValue.textContent = settings.zDepth.toFixed(1);

  // Canvas controls
  const scaleSlider = document.getElementById('scaleSlider');
  if (scaleSlider) scaleSlider.value = settings.imageScale * 100;

  const scaleValue = document.getElementById('scaleValue');
  if (scaleValue) scaleValue.textContent = Math.round(settings.imageScale * 100) + '%';

  const widthSlider = document.getElementById('widthSlider');
  if (widthSlider) widthSlider.value = settings.canvasWidthPercent;

  const widthValue = document.getElementById('widthValue');
  if (widthValue) widthValue.textContent = settings.canvasWidthPercent + '%';

  const heightSlider = document.getElementById('heightSlider');
  if (heightSlider) heightSlider.value = settings.canvasHeightPercent;

  const heightValue = document.getElementById('heightValue');
  if (heightValue) heightValue.textContent = settings.canvasHeightPercent + '%';

  // Mouse controls
  const mouseModeSelect = document.getElementById('mouseModeSelect');
  if (mouseModeSelect) mouseModeSelect.value = settings.mouseMode;

  const mouseRadiusSlider = document.getElementById('mouseRadiusSlider');
  if (mouseRadiusSlider) mouseRadiusSlider.value = settings.mouseRadius;

  const mouseRadiusValue = document.getElementById('mouseRadiusValue');
  if (mouseRadiusValue) mouseRadiusValue.textContent = settings.mouseRadius;

  const mouseStrengthSlider = document.getElementById('mouseStrengthSlider');
  if (mouseStrengthSlider) mouseStrengthSlider.value = settings.mouseStrength * 100;

  const mouseStrengthValue = document.getElementById('mouseStrengthValue');
  if (mouseStrengthValue) mouseStrengthValue.textContent = Math.round(settings.mouseStrength * 100) + '%';

  // Other toggles
  const autoToggle = document.getElementById('autoToggle');
  if (autoToggle) autoToggle.checked = settings.autoMode;

  const autoIndicator = document.getElementById('autoIndicator');
  if (autoIndicator) autoIndicator.classList.toggle('visible', settings.autoMode);

  const fpsToggle = document.getElementById('fpsToggle');
  if (fpsToggle) fpsToggle.checked = settings.showFPS;

  const fpsCounter = document.getElementById('fpsCounter');
  if (fpsCounter) fpsCounter.classList.toggle('visible', settings.showFPS);

  // Update morph button
  const morphBtn = document.getElementById('morphBtn');
  if (morphBtn) {
    if (state.isPlaying) {
      morphBtn.innerText = 'STOP';
      morphBtn.className = 'action-btn stop-state';
    } else {
      morphBtn.innerText = settings.loopMode ? 'START LOOP' : 'MORPH ONCE';
      morphBtn.className = 'action-btn start-state';
    }
  }
}

/**
 * Update status text
 */
function updateStatus(msg) {
  const statusText = document.getElementById('status-text');
  if (statusText) {
    statusText.innerText = msg;
    if (!msg.includes('Error') && !msg.includes('Processing')) {
      statusText.className = '';
    }
  }
}

/**
 * Cleanup function for page unload
 */
function cleanup() {
  // Stop animation
  stopAnimation();

  // Remove event handlers
  removeMouseInteraction();
  removeTouchInteraction();
  removeDragAndDrop();
  removeKeyboardHandlers();

  // Remove window handlers
  if (state.boundHandlers.resize) {
    window.removeEventListener('resize', state.boundHandlers.resize);
  }
  if (state.boundHandlers.visibility) {
    document.removeEventListener('visibilitychange', state.boundHandlers.visibility);
  }
  if (state.boundHandlers.contextLost) {
    state.renderer.domElement.removeEventListener('webglcontextlost', state.boundHandlers.contextLost);
  }
  if (state.boundHandlers.contextRestored) {
    state.renderer.domElement.removeEventListener('webglcontextrestored', state.boundHandlers.contextRestored);
  }

  // Revoke object URLs
  state.images.forEach(img => {
    if (img.url) URL.revokeObjectURL(img.url);
  });
  state.images = [];

  // Dispose Three.js resources
  disposeScene();

  // Close IndexedDB
  closeImageDB();

  // Clear all timeouts
  Object.values(state.timeouts).forEach(timeout => {
    if (timeout) clearTimeout(timeout);
  });
  clearDebouncedSaveTimeout();

  // Abort any pending image reprocessing
  if (state.reprocessAbortController) {
    state.reprocessAbortController.abort();
    state.reprocessAbortController = null;
  }

  // Clean up processing canvas
  if (state.processCanvas) {
    state.processCanvas.width = 1;
    state.processCanvas.height = 1;
    state.processCanvas = null;
    state.processCtx = null;
  }
}

// Register cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
