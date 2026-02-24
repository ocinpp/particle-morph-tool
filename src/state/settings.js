/**
 * Settings persistence via localStorage
 */
import { SETTINGS_STORAGE_KEY } from '../core/constants.js';
import { state, getSettings, applySettings, resetState } from './store.js';

/**
 * Save current settings to localStorage
 */
export function saveSettings() {
  const settings = getSettings();
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

  // Flash the save indicator
  const indicator = document.getElementById('saveIndicator');
  if (indicator) {
    indicator.classList.add('flash');
    if (state.timeouts.save) {
      clearTimeout(state.timeouts.save);
    }
    state.timeouts.save = setTimeout(() => indicator.classList.remove('flash'), 1000);
  }
}

/**
 * Debounced save settings (prevents excessive saves)
 */
let saveTimeout = null;
export function debouncedSaveSettings() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveSettings();
    saveTimeout = null;
  }, 300);
}

/**
 * Load settings from localStorage and apply to state and UI
 */
export function loadSettings() {
  const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!saved) return;

  try {
    const settings = JSON.parse(saved);
    applySettings(settings);
    updateUIFromSettings();
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
}

/**
 * Reset all settings to defaults
 */
export function resetSettings() {
  resetState();
  updateUIFromSettings();
  saveSettings();
  updateStatus('Settings reset to defaults');
}

/**
 * Update all UI elements from current state settings
 */
export function updateUIFromSettings() {
  const { settings } = state;

  // Animation settings
  updateCheckbox('loopToggle', settings.loopMode);
  updateCheckbox('colorToggle', settings.smoothColors);
  updateSelect('transitionModeSelect', settings.transitionMode);
  updateSelect('easingModeSelect', settings.easingMode);
  updateSlider('speedSlider', settings.morphSpeed * 1000, (settings.morphSpeed / 0.012).toFixed(1) + 'x');
  updateSlider('pauseSlider', settings.pauseDuration, (settings.pauseDuration / 60).toFixed(1) + 's');

  // Rotation settings
  updateCheckbox('rotateToggle', settings.autoRotate);
  updateSelect('rotateModeSelect', settings.rotateMode);
  updateSelect('rotateAxisSelect', settings.rotateAxis);
  updateSlider('rotateSpeedSlider', settings.rotateSpeed * 100, settings.rotateSpeed.toFixed(1) + '°/s');
  updateSlider('rotateRangeSlider', settings.rotateRange, '±' + settings.rotateRange + '°');
  updateSlider('rotatePivotSlider', settings.rotatePivot, settings.rotatePivot + '%');

  // Visual FX settings
  updateCheckbox('grayToggle', settings.useGrayscale);
  updateCheckbox('invertToggle', settings.invertColors);
  updateCheckbox('blendToggle', settings.additiveBlend);
  updateSlider('opacitySlider', settings.opacity, settings.opacity + '%');
  updateSlider('brightnessSlider', settings.brightness, settings.brightness + '%');
  updateSlider('saturationSlider', settings.saturation, settings.saturation + '%');
  updateSlider('hueSlider', settings.hueShift * 360, Math.round(settings.hueShift * 360) + '°');

  // Particle settings
  updateSlider('pointSizeSlider', settings.pointSize, settings.pointSize.toFixed(1));
  updateSlider('zDepthSlider', settings.zDepth, settings.zDepth.toFixed(1));

  // Canvas settings
  updateSlider('scaleSlider', settings.imageScale * 100, Math.round(settings.imageScale * 100) + '%');
  updateSlider('widthSlider', settings.canvasWidthPercent, settings.canvasWidthPercent + '%');
  updateSlider('heightSlider', settings.canvasHeightPercent, settings.canvasHeightPercent + '%');

  // Mouse interaction settings
  updateSelect('mouseModeSelect', settings.mouseMode);
  updateSlider('mouseRadiusSlider', settings.mouseRadius, settings.mouseRadius);
  updateSlider('mouseStrengthSlider', settings.mouseStrength * 100, Math.round(settings.mouseStrength * 100) + '%');

  // Other settings
  updateCheckbox('autoToggle', settings.autoMode);
  updateCheckbox('fpsToggle', settings.showFPS);

  // Update visibility indicators
  const autoIndicator = document.getElementById('autoIndicator');
  if (autoIndicator) {
    autoIndicator.classList.toggle('visible', settings.autoMode);
  }

  const fpsCounter = document.getElementById('fpsCounter');
  if (fpsCounter) {
    fpsCounter.classList.toggle('visible', settings.showFPS);
  }

  // Update preset buttons
  updatePresetButtons();
}

/**
 * Helper to update checkbox
 */
function updateCheckbox(id, value) {
  const el = document.getElementById(id);
  if (el) el.checked = value;
}

/**
 * Helper to update select
 */
function updateSelect(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

/**
 * Helper to update slider and its value display
 */
function updateSlider(id, value, displayText) {
  const slider = document.getElementById(id);
  if (slider) {
    slider.value = value;
    const valueEl = document.getElementById(id.replace('Slider', 'Value'));
    if (valueEl && displayText) {
      valueEl.textContent = displayText;
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
 * Update preset button active states
 */
function updatePresetButtons() {
  // Check if current settings match any preset
  const presetBtns = document.querySelectorAll('[data-preset]');

  presetBtns.forEach(btn => {
    btn.classList.remove('active');
  });

  // Check if current settings match any preset
  // This is a simplified check - in a full implementation you'd compare all values
}

/**
 * Apply settings from UI to state
 * @param {string} settingKey - The setting key to update
 * @param {*} value - The new value
 */
export function applySettingFromUI(settingKey, value) {
  if (settingKey in state.settings) {
    state.settings[settingKey] = value;
    debouncedSaveSettings();
  }
}
