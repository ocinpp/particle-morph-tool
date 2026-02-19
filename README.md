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

| Control | Description |
|---------|-------------|
| Loop Mode | Continuously morph between images |
| Smooth Colors | Blend colors during transition |
| Grayscale | Convert output to monochrome |

## Technical Details

- **Framework**: Three.js (via CDN)
- **Particle Count**: 100,000
- **Easing**: Cubic ease-in-out
- **Blend Mode**: Additive blending for glow effect
- **Max Image Size**: 1000px (auto-scaled)

## Browser Support

Requires WebGL 2.0. Works in modern Chrome, Firefox, Safari, and Edge.

## License

MIT
