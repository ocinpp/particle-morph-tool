/**
 * UI Controls - Slider and button handlers
 */
import * as THREE from 'three';
import { state } from '../state/store.js';
import { debouncedSaveSettings } from '../state/settings.js';
import { updateCanvasSize } from '../core/scene.js';
import { setBlendMode } from '../core/particles.js';
import { reprocessImages } from '../image/processor.js';
import { togglePlayback } from '../core/animation.js';
import { presets } from '../core/constants.js';

/**
 * Set up all UI control handlers
 */
export function setupControls() {
  const { particles } = state;

  // Set up UI handlers that don't require particles first
  setupAccordionHandlers();
  setupButtonHandlers();

  // Only set up particle-dependent handlers if particles exist
  if (!particles) return;

  const uniforms = particles.material.uniforms;

  // ===== Animation Controls =====

  // Loop toggle
  setupToggle('loopToggle', (checked) => {
    state.settings.loopMode = checked;
    updateMorphButton();
    debouncedSaveSettings();
  });

  // Smooth colors toggle
  setupToggle('colorToggle', (checked) => {
    state.settings.smoothColors = checked;
    uniforms.uSmoothColors.value = checked ? 1.0 : 0.0;
    state.needsRender = true;
    debouncedSaveSettings();
  });

  // Transition mode
  setupSelect('transitionModeSelect', (value) => {
    state.settings.transitionMode = parseInt(value);
    uniforms.uTransitionMode.value = state.settings.transitionMode;
    state.needsRender = true;
    debouncedSaveSettings();
  });

  // Easing mode
  setupSelect('easingModeSelect', (value) => {
    state.settings.easingMode = parseInt(value);
    uniforms.uEasingMode.value = state.settings.easingMode;
    state.needsRender = true;
    debouncedSaveSettings();
  });

  // Speed slider
  setupSlider('speedSlider', 'speedValue', (value) => {
    state.settings.morphSpeed = value / 1000;
    document.getElementById('speedValue').textContent = (state.settings.morphSpeed / 0.012).toFixed(1) + 'x';
    debouncedSaveSettings();
  });

  // Pause slider
  setupSlider('pauseSlider', 'pauseValue', (value) => {
    state.settings.pauseDuration = parseInt(value);
    document.getElementById('pauseValue').textContent = (state.settings.pauseDuration / 60).toFixed(1) + 's';
    debouncedSaveSettings();
  });

  // ===== Rotation Controls =====

  setupToggle('rotateToggle', (checked) => {
    state.settings.autoRotate = checked;
    if (!checked && particles) {
      particles.rotation.set(0, 0, 0);
      particles.position.x = 0;
      particles.position.y = 0;
    }
    state.needsRender = true;
    debouncedSaveSettings();
  });

  setupSelect('rotateModeSelect', (value) => {
    state.settings.rotateMode = parseInt(value);
    debouncedSaveSettings();
  });

  setupSelect('rotateAxisSelect', (value) => {
    state.settings.rotateAxis = value;
    debouncedSaveSettings();
  });

  setupSlider('rotateSpeedSlider', 'rotateSpeedValue', (value) => {
    state.settings.rotateSpeed = value / 100;
    document.getElementById('rotateSpeedValue').textContent = state.settings.rotateSpeed.toFixed(1) + '°/s';
    debouncedSaveSettings();
  });

  setupSlider('rotateRangeSlider', 'rotateRangeValue', (value) => {
    state.settings.rotateRange = parseInt(value);
    document.getElementById('rotateRangeValue').textContent = '±' + state.settings.rotateRange + '°';
    debouncedSaveSettings();
  });

  setupSlider('rotatePivotSlider', 'rotatePivotValue', (value) => {
    state.settings.rotatePivot = parseInt(value);
    document.getElementById('rotatePivotValue').textContent = state.settings.rotatePivot + '%';
    debouncedSaveSettings();
  });

  // ===== Visual FX Controls =====

  setupToggle('grayToggle', (checked) => {
    state.settings.useGrayscale = checked;
    uniforms.uGrayscale.value = checked ? 1.0 : 0.0;
    state.needsRender = true;
    debouncedSaveSettings();
  });

  setupToggle('invertToggle', (checked) => {
    state.settings.invertColors = checked;
    uniforms.uInvert.value = checked ? 1.0 : 0.0;
    state.needsRender = true;
    debouncedSaveSettings();
  });

  setupToggle('blendToggle', (checked) => {
    state.settings.additiveBlend = checked;
    setBlendMode(checked);
    debouncedSaveSettings();
  });

  setupSlider('opacitySlider', 'opacityValue', (value) => {
    state.settings.opacity = parseInt(value);
    uniforms.uOpacity.value = state.settings.opacity / 100;
    document.getElementById('opacityValue').textContent = state.settings.opacity + '%';
    state.needsRender = true;
    debouncedSaveSettings();
  });

  setupSlider('brightnessSlider', 'brightnessValue', (value) => {
    state.settings.brightness = parseInt(value);
    uniforms.uBrightness.value = state.settings.brightness / 100;
    document.getElementById('brightnessValue').textContent = state.settings.brightness + '%';
    state.needsRender = true;
    debouncedSaveSettings();
  });

  setupSlider('saturationSlider', 'saturationValue', (value) => {
    state.settings.saturation = parseInt(value);
    uniforms.uSaturation.value = state.settings.saturation / 100;
    document.getElementById('saturationValue').textContent = state.settings.saturation + '%';
    state.needsRender = true;
    debouncedSaveSettings();
  });

  setupSlider('hueSlider', 'hueValue', (value) => {
    state.settings.hueShift = value / 360;
    uniforms.uHueShift.value = state.settings.hueShift;
    document.getElementById('hueValue').textContent = Math.round(value) + '°';
    state.needsRender = true;
    debouncedSaveSettings();
  });

  // ===== Particle Controls =====

  setupSlider('pointSizeSlider', 'pointSizeValue', (value) => {
    state.settings.pointSize = parseFloat(value);
    uniforms.uPointSize.value = state.settings.pointSize;
    document.getElementById('pointSizeValue').textContent = state.settings.pointSize.toFixed(1);
    state.needsRender = true;
    debouncedSaveSettings();
  });

  setupSlider('zDepthSlider', 'zDepthValue', (value) => {
    state.settings.zDepth = parseFloat(value);
    document.getElementById('zDepthValue').textContent = state.settings.zDepth.toFixed(1);
    debouncedSaveSettings();
    reprocessImages();
  });

  // ===== Canvas Controls =====

  setupSlider('scaleSlider', 'scaleValue', (value) => {
    state.settings.imageScale = value / 100;
    document.getElementById('scaleValue').textContent = Math.round(value) + '%';
    debouncedSaveSettings();
    reprocessImages();
  });

  setupSlider('widthSlider', 'widthValue', (value) => {
    state.settings.canvasWidthPercent = parseInt(value);
    document.getElementById('widthValue').textContent = state.settings.canvasWidthPercent + '%';
    updateCanvasSize(state.settings.canvasWidthPercent, state.settings.canvasHeightPercent);
    debouncedSaveSettings();
  });

  setupSlider('heightSlider', 'heightValue', (value) => {
    state.settings.canvasHeightPercent = parseInt(value);
    document.getElementById('heightValue').textContent = state.settings.canvasHeightPercent + '%';
    updateCanvasSize(state.settings.canvasWidthPercent, state.settings.canvasHeightPercent);
    debouncedSaveSettings();
  });

  // Background color picker
  const bgColorPicker = document.getElementById('bgColorPicker');
  if (bgColorPicker) {
    bgColorPicker.addEventListener('input', (e) => {
      const color = e.target.value;
      state.scene.background = new THREE.Color(color);
      document.body.style.background = color;
      state.needsRender = true;
    });
  }

  // Auto mode toggle
  setupToggle('autoToggle', (checked) => {
    state.settings.autoMode = checked;
    const indicator = document.getElementById('autoIndicator');
    if (indicator) {
      indicator.classList.toggle('visible', checked);
    }
    debouncedSaveSettings();
  });

  // FPS toggle
  setupToggle('fpsToggle', (checked) => {
    state.settings.showFPS = checked;
    const fpsCounter = document.getElementById('fpsCounter');
    if (fpsCounter) {
      fpsCounter.classList.toggle('visible', checked);
    }
    debouncedSaveSettings();
  });

  // ===== Mouse Controls =====

  setupSelect('mouseModeSelect', (value) => {
    state.settings.mouseMode = parseInt(value);
    uniforms.uMouseMode.value = state.settings.mouseMode;
    debouncedSaveSettings();
  });

  setupSlider('mouseRadiusSlider', 'mouseRadiusValue', (value) => {
    state.settings.mouseRadius = parseInt(value);
    uniforms.uMouseRadius.value = state.settings.mouseRadius;
    document.getElementById('mouseRadiusValue').textContent = state.settings.mouseRadius;
    debouncedSaveSettings();
  });

  setupSlider('mouseStrengthSlider', 'mouseStrengthValue', (value) => {
    state.settings.mouseStrength = value / 100;
    uniforms.uMouseStrength.value = state.settings.mouseStrength;
    document.getElementById('mouseStrengthValue').textContent = Math.round(value) + '%';
    debouncedSaveSettings();
  });

  // ===== Main Action Buttons =====

  // Morph button
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

  // Collapse button
  const collapseBtn = document.getElementById('collapseBtn');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      const ui = document.getElementById('ui');
      const restoreBtn = document.getElementById('restoreBtn');
      if (ui) ui.classList.add('hidden');
      if (restoreBtn) restoreBtn.style.display = 'block';
    });
  }

  // Restore button
  const restoreBtn = document.getElementById('restoreBtn');
  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      const ui = document.getElementById('ui');
      if (ui) ui.classList.remove('hidden');
      restoreBtn.style.display = 'none';
    });
  }
}

/**
 * Helper to set up a toggle checkbox
 */
function setupToggle(id, callback) {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', (e) => callback(e.target.checked));
  }
}

/**
 * Helper to set up a select dropdown
 */
function setupSelect(id, callback) {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', (e) => callback(e.target.value));
  }
}

/**
 * Helper to set up a slider
 */
function setupSlider(id, valueId, callback) {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', (e) => callback(parseFloat(e.target.value)));
  }
}

/**
 * Set up accordion section handlers
 */
function setupAccordionHandlers() {
  const headers = document.querySelectorAll('.accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const section = header.parentElement;
      section.classList.toggle('open');
    });
  });
}

/**
 * Set up general button handlers
 */
function setupButtonHandlers() {
  // Preset buttons
  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyPreset(btn.dataset.preset);
    });
  });

  // Canvas size preset buttons
  document.querySelectorAll('[data-width]').forEach(btn => {
    btn.addEventListener('click', () => {
      const width = parseInt(btn.dataset.width);
      const height = parseInt(btn.dataset.height);

      state.settings.canvasWidthPercent = width;
      state.settings.canvasHeightPercent = height;

      const widthSlider = document.getElementById('widthSlider');
      const heightSlider = document.getElementById('heightSlider');
      const widthValue = document.getElementById('widthValue');
      const heightValue = document.getElementById('heightValue');

      if (widthSlider) widthSlider.value = width;
      if (widthValue) widthValue.textContent = width + '%';
      if (heightSlider) heightSlider.value = height;
      if (heightValue) heightValue.textContent = height + '%';

      updateCanvasSize(width, height);

      // Update active state
      document.querySelectorAll('[data-width]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      debouncedSaveSettings();
    });
  });
}

/**
 * Update morph button text based on state
 */
function updateMorphButton() {
  const btn = document.getElementById('morphBtn');
  if (!btn) return;

  if (state.isPlaying) {
    btn.innerText = 'STOP';
    btn.className = 'action-btn stop-state';
  } else {
    btn.innerText = state.settings.loopMode ? 'START LOOP' : 'MORPH ONCE';
    btn.className = 'action-btn start-state';
  }
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
  Object.assign(state.settings, {
    loopMode: true,
    smoothColors: true,
    transitionMode: 0,
    easingMode: 0,
    morphSpeed: 0.012,
    pauseDuration: 120,
    autoRotate: false,
    rotateMode: 0,
    rotateAxis: 'y',
    rotateSpeed: 0.5,
    rotateRange: 180,
    rotatePivot: 0,
    useGrayscale: false,
    invertColors: false,
    additiveBlend: true,
    opacity: 100,
    brightness: 100,
    saturation: 100,
    hueShift: 0,
    pointSize: 3.0,
    zDepth: 2.0,
    imageScale: 0.9,
    canvasWidthPercent: 100,
    canvasHeightPercent: 100,
    mouseMode: 0,
    mouseRadius: 150,
    mouseStrength: 3.0,
    autoMode: false,
    showFPS: false,
  });

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
  setBlendMode(true);

  // Reset rotation
  state.particles.rotation.set(0, 0, 0);
  state.particles.position.x = 0;
  state.particles.position.y = 0;

  // Update UI elements
  updateControlsUI();

  // Save and show status
  debouncedSaveSettings();
  updateStatus('Settings reset to defaults');
}

/**
 * Update all control UI elements from state
 */
function updateControlsUI() {
  const { settings } = state;

  document.getElementById('loopToggle').checked = settings.loopMode;
  document.getElementById('colorToggle').checked = settings.smoothColors;
  document.getElementById('transitionModeSelect').value = settings.transitionMode;
  document.getElementById('easingModeSelect').value = settings.easingMode;
  document.getElementById('speedSlider').value = settings.morphSpeed * 1000;
  document.getElementById('speedValue').textContent = (settings.morphSpeed / 0.012).toFixed(1) + 'x';
  document.getElementById('pauseSlider').value = settings.pauseDuration;
  document.getElementById('pauseValue').textContent = (settings.pauseDuration / 60).toFixed(1) + 's';

  document.getElementById('rotateToggle').checked = settings.autoRotate;
  document.getElementById('rotateModeSelect').value = settings.rotateMode;
  document.getElementById('rotateAxisSelect').value = settings.rotateAxis;
  document.getElementById('rotateSpeedSlider').value = settings.rotateSpeed * 100;
  document.getElementById('rotateSpeedValue').textContent = settings.rotateSpeed.toFixed(1) + '°/s';
  document.getElementById('rotateRangeSlider').value = settings.rotateRange;
  document.getElementById('rotateRangeValue').textContent = '±' + settings.rotateRange + '°';
  document.getElementById('rotatePivotSlider').value = settings.rotatePivot;
  document.getElementById('rotatePivotValue').textContent = settings.rotatePivot + '%';

  document.getElementById('grayToggle').checked = settings.useGrayscale;
  document.getElementById('invertToggle').checked = settings.invertColors;
  document.getElementById('blendToggle').checked = settings.additiveBlend;
  document.getElementById('opacitySlider').value = settings.opacity;
  document.getElementById('opacityValue').textContent = settings.opacity + '%';
  document.getElementById('brightnessSlider').value = settings.brightness;
  document.getElementById('brightnessValue').textContent = settings.brightness + '%';
  document.getElementById('saturationSlider').value = settings.saturation;
  document.getElementById('saturationValue').textContent = settings.saturation + '%';
  document.getElementById('hueSlider').value = settings.hueShift * 360;
  document.getElementById('hueValue').textContent = Math.round(settings.hueShift * 360) + '°';

  document.getElementById('pointSizeSlider').value = settings.pointSize;
  document.getElementById('pointSizeValue').textContent = settings.pointSize.toFixed(1);
  document.getElementById('zDepthSlider').value = settings.zDepth;
  document.getElementById('zDepthValue').textContent = settings.zDepth.toFixed(1);

  document.getElementById('scaleSlider').value = settings.imageScale * 100;
  document.getElementById('scaleValue').textContent = Math.round(settings.imageScale * 100) + '%';
  document.getElementById('widthSlider').value = settings.canvasWidthPercent;
  document.getElementById('widthValue').textContent = settings.canvasWidthPercent + '%';
  document.getElementById('heightSlider').value = settings.canvasHeightPercent;
  document.getElementById('heightValue').textContent = settings.canvasHeightPercent + '%';

  document.getElementById('mouseModeSelect').value = settings.mouseMode;
  document.getElementById('mouseRadiusSlider').value = settings.mouseRadius;
  document.getElementById('mouseRadiusValue').textContent = settings.mouseRadius;
  document.getElementById('mouseStrengthSlider').value = settings.mouseStrength * 100;
  document.getElementById('mouseStrengthValue').textContent = Math.round(settings.mouseStrength * 100) + '%';

  document.getElementById('autoToggle').checked = settings.autoMode;
  document.getElementById('autoIndicator').classList.toggle('visible', settings.autoMode);
  document.getElementById('fpsToggle').checked = settings.showFPS;
  document.getElementById('fpsCounter').classList.toggle('visible', settings.showFPS);

  updateMorphButton();
}

/**
 * Apply a preset configuration
 */
function applyPreset(name) {
  const preset = presets[name];
  if (!preset || !state.particles) return;

  const uniforms = state.particles.material.uniforms;

  // Update blending
  setBlendMode(preset.additive);
  document.getElementById('blendToggle').checked = preset.additive;

  // Update brightness
  state.settings.brightness = preset.brightness;
  uniforms.uBrightness.value = preset.brightness / 100;
  document.getElementById('brightnessSlider').value = preset.brightness;
  document.getElementById('brightnessValue').textContent = preset.brightness + '%';

  // Update saturation
  state.settings.saturation = preset.saturation;
  uniforms.uSaturation.value = preset.saturation / 100;
  document.getElementById('saturationSlider').value = preset.saturation;
  document.getElementById('saturationValue').textContent = preset.saturation + '%';

  // Update opacity
  state.settings.opacity = preset.opacity;
  uniforms.uOpacity.value = preset.opacity / 100;
  document.getElementById('opacitySlider').value = preset.opacity;
  document.getElementById('opacityValue').textContent = preset.opacity + '%';

  // Update point size
  state.settings.pointSize = preset.pointSize;
  uniforms.uPointSize.value = preset.pointSize;
  document.getElementById('pointSizeSlider').value = preset.pointSize;
  document.getElementById('pointSizeValue').textContent = preset.pointSize.toFixed(1);

  // Update hue
  state.settings.hueShift = preset.hue / 360;
  uniforms.uHueShift.value = state.settings.hueShift;
  document.getElementById('hueSlider').value = preset.hue;
  document.getElementById('hueValue').textContent = preset.hue + '°';

  // Update transition mode
  state.settings.transitionMode = preset.transition;
  uniforms.uTransitionMode.value = preset.transition;
  document.getElementById('transitionModeSelect').value = preset.transition;

  // Update preset button states
  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === name);
  });

  state.needsRender = true;
  updateStatus('Applied: ' + name.charAt(0).toUpperCase() + name.slice(1));
  debouncedSaveSettings();
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
