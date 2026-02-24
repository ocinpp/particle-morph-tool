/**
 * Tests for color utilities
 */
import { describe, it, expect } from 'vitest';

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

describe('Color Utilities', () => {
  describe('getLuminance', () => {
    it('should return 0 for black', () => {
    expect(getLuminance('#000000')).toBe(0);
    });

    it('should return 1 for white', () => {
      expect(getLuminance('#ffffff')).toBeCloseTo(1, 5);
    });

    it('should return correct luminance for red', () => {
      // Red has low luminance (0.299)
      expect(getLuminance('#ff0000')).toBeCloseTo(0.299, 3);
    });

    it('should return correct luminance for green', () => {
      // Green has high luminance (0.587)
      expect(getLuminance('#00ff00')).toBeCloseTo(0.587, 3);
    });

    it('should return correct luminance for blue', () => {
      // Blue has low luminance (0.114)
      expect(getLuminance('#0000ff')).toBeCloseTo(0.114, 3);
    });

    it('should work without hash prefix', () => {
      expect(getLuminance('ff0000')).toBeCloseTo(0.299, 3);
    });

    it('should identify dark colors correctly', () => {
      const darkColors = ['#111111', '#222222', '#0a0a0a'];
      darkColors.forEach(color => {
        expect(getLuminance(color)).toBeLessThan(0.2);
      });
    });

    it('should identify light colors correctly', () => {
      const lightColors = ['#ffffff', '#eeeeee', '#cccccc'];
      lightColors.forEach(color => {
        expect(getLuminance(color)).toBeGreaterThan(0.5);
      });
    });
  });
});
