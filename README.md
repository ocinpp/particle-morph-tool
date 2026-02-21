# Particle Morph Tool

A Three.js application that creates stunning particle morphing effects between two images using custom GLSL shaders.

## Features

- **100,000 particles** animating smoothly between image shapes
- **Custom GLSL shaders** with cubic easing and swirl effects
- **4 transition effects**: Default Chaos, Spiral Vortex, Explosion, Reverse Gravity
- **Adjustable speed** - control animation speed from 0.2x to 4.0x
- **Staggered transitions** - particles move with randomized delays
- **Color interpolation** - smooth or snap color transitions
- **Grayscale mode** - toggle monochrome output
- **Loop mode** - continuous A↔B morphing with pauses
- **Mouse interaction** - attract or repel particles
- **Keyboard shortcuts** - Space to play/pause, Escape to toggle UI
- **Image previews** - thumbnail and filename shown after upload
- **Collapsible UI** - hide controls for fullscreen viewing
- **Auto BG mode** - automatically adjust settings based on background color
- **Error handling** - graceful recovery from WebGL context loss

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
| Transition Effect | Choose morph animation style (see below) |
| Grayscale | Convert output to monochrome |
| Auto (for BG) | Auto-adjust settings based on background brightness |
| Additive Blend | Glow effect (best for dark backgrounds) |

### Transition Effects

| Effect | Description |
|--------|-------------|
| Default Chaos | Swirling noise effect during transition |
| Spiral Vortex | Particles spin around center axis with Z-wave |
| Explosion | Particles burst outward then reform |
| Reverse Gravity | Particles float upward like fireworks |

### Sliders

| Control | Range | Description |
|---------|-------|-------------|
| Speed | 0.2-4.0x | Animation speed multiplier |
| Image Scale | 10-100% | Scale of the particle image |
| Canvas Width | 20-100% | Viewport width percentage |
| Canvas Height | 20-100% | Viewport height percentage |
| Opacity | 10-400% | Particle transparency |
| Brightness | 50-300% | Particle brightness multiplier |
| Saturation | 0-300% | Color saturation (boost for light backgrounds) |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause animation |
| `Escape` | Toggle UI panel visibility |

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

## Performance

- Mouse events throttled to ~30fps
- Rendering paused when tab is hidden
- Conditional rendering (only redraws when needed)
- Object reuse to minimize garbage collection
- Proper cleanup on page unload (URLs revoked, WebGL context released)

## Browser Support

Requires WebGL 2.0. Works in modern Chrome, Firefox, Safari, and Edge.

## License

MIT
