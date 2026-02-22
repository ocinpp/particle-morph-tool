# Particle Morph Tool

A Three.js application that creates stunning particle morphing effects between multiple images using custom GLSL shaders.

## Features

- **100,000 particles** animating smoothly between image shapes
- **Multi-image support** - cycle through unlimited images in sequence
- **Custom GLSL shaders** with cubic easing and swirl effects
- **4 transition effects**: Default Chaos, Spiral Vortex, Explosion, Reverse Gravity
- **6 visual presets**: Default, Neon, Pastel, Ghost, Fire, Ice
- **Adjustable speed** - control animation speed from 0.2x to 4.0x
- **Particle customization** - size and Z-depth control
- **Color effects** - hue shift, saturation, brightness, invert controls
- **Staggered transitions** - particles move with randomized delays
- **Color interpolation** - smooth or snap color transitions
- **Grayscale mode** - toggle monochrome output
- **Invert mode** - invert all colors for negative effect
- **Auto-rotate** - continuously rotate particles around Y-axis
- **Adjustable pause duration** - control time between morph transitions
- **Loop mode** - continuous morphing through all images with pauses
- **Mouse/touch interaction** - attract or repel particles
- **Keyboard shortcuts** - Space to play/pause, Escape to toggle UI
- **Image list UI** - add, remove, and select images visually
- **Drag & drop** - drop multiple images directly onto canvas
- **Screenshot capture** - save current frame as PNG
- **Collapsible UI** - hide controls for fullscreen viewing
- **Auto BG mode** - automatically adjust settings based on background color
- **Error handling** - graceful recovery from WebGL context loss

## Usage

1. Open `morph.html` in a modern browser
2. Click **+ Add Image** to upload images (or drag & drop)
3. Add at least **2 images** to enable morphing
4. Click **Start Loop** to begin cycling through images

### Image Tips

- Use images with transparent backgrounds (PNG) for best results
- Images are scaled to fit the viewport
- Particles sample from opaque pixels (alpha > 128)
- Add multiple images to create longer sequences

### Images Panel

| Action | How |
|--------|-----|
| Add image | Click "+ Add Image" button or drag & drop onto canvas |
| Remove image | Click the × button on any image |
| View image | Click on an image in the list |
| Reorder | Drag an image to a new position in the list |

The counter shows current position (e.g., "2 of 5").

## Controls

### Toggles

| Control | Description |
|---------|-------------|
| Loop Mode | Continuously morph between images |
| Smooth Colors | Blend colors during transition |
| Transition Effect | Choose morph animation style (see below) |
| Grayscale | Convert output to monochrome |
| Invert Colors | Invert all colors (negative effect) |
| Auto Rotate | Continuously rotate particles around Y-axis |
| Show FPS | Display frame rate counter in bottom right |
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
| Pause Duration | 0-5s | Time between morph transitions in loop mode |
| Rotate Speed | 0.01-2.0°/s | Rotation speed when Auto Rotate is enabled |
| Image Scale | 10-100% | Scale of the particle image |
| Canvas Width | 20-100% | Viewport width percentage |
| Canvas Height | 20-100% | Viewport height percentage |
| Opacity | 10-400% | Particle transparency |
| Brightness | 50-300% | Particle brightness multiplier |
| Saturation | 0-300% | Color saturation (boost for light backgrounds) |
| Hue Shift | 0-360° | Rotate all colors around color wheel |
| Point Size | 1.0-10.0 | Size of individual particles |
| Z-Depth | 0-50 | Particle spread on Z-axis (3D depth) |
| Mouse Radius | 20-300 | Radius of mouse interaction effect |
| Mouse Strength | 10-500% | Strength of mouse attraction/repulsion |

### Canvas Presets

Quick buttons to set common aspect ratios:

| Preset | Size | Use Case |
|--------|------|----------|
| Full | 100×100% | Fill entire viewport |
| 16:9 | 100×56% | Widescreen video |
| 9:16 | 56×100% | Portrait/mobile |
| 1:1 | 100×100% | Square (social media) |
| 4:3 | 100×75% | Traditional TV |

### Visual Presets

| Preset | Description |
|--------|-------------|
| Default | Standard settings with additive blending |
| Neon | High saturation, purple hue, spiral transition |
| Pastel | Soft colors, lower saturation, explosion transition |
| Ghost | Low opacity, ethereal look, reverse gravity transition |
| Fire | Warm colors, high brightness, reverse gravity transition |
| Ice | Cool blue hue, spiral transition |

### Touch Support

On touch devices:
- **Tap** - Attract particles briefly (1 second)
- **Long press** - Repel particles while holding

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause animation |
| `Escape` | Toggle UI panel visibility |
| `F` | Toggle fullscreen mode |

### Performance

- **FPS Counter** - Toggle in Animation section to show frame rate
- **Settings Persistence** - All settings and images auto-save and restore on next visit (green ● flashes when saved)
- **Reset Button** - Click ↺ in header to reset all settings to defaults (with confirmation)

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
