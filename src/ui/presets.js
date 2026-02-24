/**
 * Preset configurations and UI
 */
import { presets } from '../core/constants.js';
import { state } from '../state/store.js';
import { setBlendMode } from '../core/particles.js';
import { debouncedSaveSettings } from '../state/settings.js';

/**
 * Apply a visual preset by name
 * @param {string} name - Preset name (default, neon, pastel, ghost, fire, ice)
 */
export function applyPreset(name) {
  const preset = presets[name];
  if (!preset || !state.particles) return;

  const uniforms = state.particles.material.uniforms;

  // Update blending
  setBlendMode(preset.additive);
  const blendToggle = document.getElementById('blendToggle');
  if (blendToggle) blendToggle.checked = preset.additive;

  // Update brightness
  state.settings.brightness = preset.brightness;
  uniforms.uBrightness.value = preset.brightness / 100;
  updateSliderUI('brightnessSlider', 'brightnessValue', preset.brightness, preset.brightness + '%');

  // Update saturation
  state.settings.saturation = preset.saturation;
  uniforms.uSaturation.value = preset.saturation / 100;
  updateSliderUI('saturationSlider', 'saturationValue', preset.saturation, preset.saturation + '%');

  // Update opacity
  state.settings.opacity = preset.opacity;
  uniforms.uOpacity.value = preset.opacity / 100;
  updateSliderUI('opacitySlider', 'opacityValue', preset.opacity, preset.opacity + '%');

  // Update point size
  state.settings.pointSize = preset.pointSize;
  uniforms.uPointSize.value = preset.pointSize;
  updateSliderUI('pointSizeSlider', 'pointSizeValue', preset.pointSize, preset.pointSize.toFixed(1));

  // Update hue shift
  state.settings.hueShift = preset.hue / 360;
  uniforms.uHueShift.value = state.settings.hueShift;
  updateSliderUI('hueSlider', 'hueValue', preset.hue, preset.hue + '°');

  // Update transition mode
  state.settings.transitionMode = preset.transition;
  uniforms.uTransitionMode.value = preset.transition;
  const transitionSelect = document.getElementById('transitionModeSelect');
  if (transitionSelect) transitionSelect.value = preset.transition;

  // Update preset button states
  updatePresetButtons(name);

  state.needsRender = true;
  updateStatus('Applied: ' + capitalizeFirst(name));
  debouncedSaveSettings();
}

/**
 * Update preset button active states
 * @param {string} activeName - Name of active preset
 */
export function updatePresetButtons(activeName) {
  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === activeName);
  });
}

/**
 * Get all preset names
 * @returns {string[]}
 */
export function getPresetNames() {
  return Object.keys(presets);
}

/**
 * Get a specific preset by name
 * @param {string} name - Preset name
 * @returns {Object|null}
 */
export function getPreset(name) {
  return presets[name] || null;
}

/**
 * Helper to update slider UI
 */
function updateSliderUI(sliderId, valueId, value, displayText) {
  const slider = document.getElementById(sliderId);
  const valueEl = document.getElementById(valueId);
  if (slider) slider.value = value;
  if (valueEl) valueEl.textContent = displayText;
}

/**
 * Helper to capitalize first letter
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Helper to update status
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
 * Set up preset button handlers
 */
export function setupPresetHandlers() {
  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyPreset(btn.dataset.preset);
    });
  });
}

/**
 * Apply auto settings based on background color
 * @param {string} hexColor - Background hex color
 */
export function applyAutoSettings(hexColor) {
  if (!state.particles) return;

  const luminance = getLuminance(hexColor);
  const isLightBg = luminance > 0.5;

  // Settings for light vs dark backgrounds
  const settings = isLightBg ? {
    additive: false,
    brightness: 100,
    saturation: 175,
    opacity: 150
  } : {
    additive: true,
    brightness: 100,
    saturation: 100,
    opacity: 100
  };

  const uniforms = state.particles.material.uniforms;

  // Update blending
  setBlendMode(settings.additive);
  const blendToggle = document.getElementById('blendToggle');
  if (blendToggle) blendToggle.checked = settings.additive;

  // Update brightness
  state.settings.brightness = settings.brightness;
  uniforms.uBrightness.value = settings.brightness / 100;
  updateSliderUI('brightnessSlider', 'brightnessValue', settings.brightness, settings.brightness + '%');

  // Update saturation
  state.settings.saturation = settings.saturation;
  uniforms.uSaturation.value = settings.saturation / 100;
  updateSliderUI('saturationSlider', 'saturationValue', settings.saturation, settings.saturation + '%');

  // Update opacity
  state.settings.opacity = settings.opacity;
  uniforms.uOpacity.value = settings.opacity / 100;
  updateSliderUI('opacitySlider', 'opacityValue', settings.opacity, settings.opacity + '%');

  state.needsRender = true;
}

/**
 * Calculate luminance from hex color
 * @param {string} hexColor - Hex color string
 * @returns {number} Luminance value (0-1)
 */
function getLuminance(hexColor) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
