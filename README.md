# Particle Morph Tool

A Three.js application that creates stunning particle morphing effects between two images using custom GLSL shaders.

## Features

- **100,000 particles** animating smoothly between image shapes
- **Custom GLSL shaders** with cubic easing and swirl effects
- **Staggered transitions** - particles move with randomized delays
- **Color interpolation** - smooth or snap color transitions
- **Grayscale mode** - toggle monochrome output
- **Loop mode** - continuous A↔B morphing with pauses
- **Collapsible UI** - hide controls for fullscreen viewing
- **Auto BG mode** - automatically adjust settings based on background color
- **Compact responsive UI** - fits on screen with scroll support

## Usage

1. Open `morph.html` in a modern browser
2. Upload **Image A** (start shape)
3. Upload **Image B** (target shape)
4. Click **Start Loop** to begin morphing

### Image Tips

- Use images with transparent backgrounds (PNG) for best results
- Images are scaled to fit the viewport
- Particles sample from opaque pixels (alpha > 128)

## Controls

### Toggles

| Control | Description |
|---------|-------------|
| Loop Mode | Continuously morph between images |
| Smooth Colors | Blend colors during transition |
| Grayscale | Convert output to monochrome |
| Auto (for BG) | Auto-adjust settings based on background brightness |
| Additive Blend | Glow effect (best for dark backgrounds) |

### Sliders

| Control | Range | Description |
|---------|-------|-------------|
| Image Scale | 10-100% | Scale of the particle image |
| Canvas Width | 20-100% | Viewport width percentage |
| Canvas Height | 20-100% | Viewport height percentage |
| Opacity | 10-400% | Particle transparency |
| Brightness | 50-300% | Particle brightness multiplier |
| Saturation | 0-300% | Color saturation (boost for light backgrounds) |

### Auto BG Mode

When enabled, automatically adjusts settings based on background luminance:

**Light backgrounds** (luminance > 50%):
- Additive Blend: OFF
- Saturation: 175%
- Opacity: 150%

**Dark backgrounds** (luminance <= 50%):
- Additive Blend: ON
- Saturation: 100%
- Opacity: 100%

A green "AUTO BG" indicator appears in the top right corner when active.

## Technical Details

- **Framework**: Three.js (via CDN)
- **Particle Count**: 100,000
- **Easing**: Cubic ease-in-out
- **Blend Mode**: Additive or Normal (configurable)
- **Max Image Size**: 1000px (auto-scaled)

## Browser Support

Requires WebGL 2.0. Works in modern Chrome, Firefox, Safari, and Edge.

## License

MIT
