/**
 * Tests for constants module
 */
import { describe, it, expect } from 'vitest';
import {
  PARTICLE_COUNT,
  MAX_DELAY,
  DEFAULT_MORPH_SPEED,
  DEFAULT_PAUSE_DURATION,
  DEFAULT_POINT_SIZE,
  defaultSettings,
  presets,
} from '../../src/core/constants.js';

describe('Constants Module', () => {
  describe('Particle Configuration', () => {
    it('should have correct PARTICLE_COUNT', () => {
      expect(PARTICLE_COUNT).toBe(100000);
    });

    it('should have correct MAX_DELAY', () => {
      expect(MAX_DELAY).toBe(0.3);
    });
  });

  describe('Default Values', () => {
    it('should have correct DEFAULT_MORPH_SPEED', () => {
      expect(DEFAULT_MORPH_SPEED).toBe(0.012);
    });

    it('should have correct DEFAULT_PAUSE_DURATION', () => {
      expect(DEFAULT_PAUSE_DURATION).toBe(120);
    });

    it('should have correct DEFAULT_POINT_SIZE', () => {
      expect(DEFAULT_POINT_SIZE).toBe(3.0);
    });
  });

  describe('Default Settings', () => {
    it('should have all required properties', () => {
      expect(defaultSettings).toHaveProperty('loopMode');
      expect(defaultSettings).toHaveProperty('smoothColors');
      expect(defaultSettings).toHaveProperty('transitionMode');
      expect(defaultSettings).toHaveProperty('easingMode');
      expect(defaultSettings).toHaveProperty('morphSpeed');
      expect(defaultSettings).toHaveProperty('pointSize');
      expect(defaultSettings).toHaveProperty('opacity');
      expect(defaultSettings).toHaveProperty('brightness');
      expect(defaultSettings).toHaveProperty('saturation');
      expect(defaultSettings).toHaveProperty('autoRotate');
      expect(defaultSettings).toHaveProperty('mouseMode');
    });

    it('should have sensible default values', () => {
      expect(defaultSettings.loopMode).toBe(true);
      expect(defaultSettings.smoothColors).toBe(true);
      expect(defaultSettings.transitionMode).toBe(0);
      expect(defaultSettings.opacity).toBe(100);
      expect(defaultSettings.brightness).toBe(100);
      expect(defaultSettings.saturation).toBe(100);
    });
  });

  describe('Presets', () => {
    it('should have all required presets', () => {
      expect(presets).toHaveProperty('default');
      expect(presets).toHaveProperty('neon');
      expect(presets).toHaveProperty('pastel');
      expect(presets).toHaveProperty('ghost');
      expect(presets).toHaveProperty('fire');
      expect(presets).toHaveProperty('ice');
    });

    it('should have valid values in each preset', () => {
      Object.keys(presets).forEach(presetName => {
        const preset = presets[presetName];
        expect(typeof preset.additive).toBe('boolean');
        expect(preset.brightness).toBeGreaterThanOrEqual(0);
        expect(preset.brightness).toBeLessThanOrEqual(300);
        expect(preset.saturation).toBeGreaterThanOrEqual(0);
        expect(preset.saturation).toBeLessThanOrEqual(300);
        expect(preset.opacity).toBeGreaterThanOrEqual(0);
        expect(preset.opacity).toBeLessThanOrEqual(400);
        expect(preset.pointSize).toBeGreaterThan(0);
        expect(preset.pointSize).toBeLessThanOrEqual(10);
        expect(preset.hue).toBeGreaterThanOrEqual(0);
        expect(preset.hue).toBeLessThanOrEqual(360);
        expect(preset.transition).toBeGreaterThanOrEqual(0);
        expect(preset.transition).toBeLessThanOrEqual(3);
      });
    });
  });
});
