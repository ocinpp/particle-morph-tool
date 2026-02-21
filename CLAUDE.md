# Particle Morph Tool - Claude Context

## Project Overview

Single-file Three.js application for particle morphing effects between multiple images.

## File Structure

```
particles-effects/
├── morph.html      # Main application (self-contained)
├── README.md       # User documentation
└── CLAUDE.md       # This file
```

## Architecture

### Core Components

**Three.js Scene Setup**
- Scene, camera (PerspectiveCamera, z=500), WebGLRenderer
- Single Points object with ShaderMaterial
- Configurable canvas size via sliders

**Particle System**
- 100,000 particles via BufferGeometry
- Attributes: position, aStartPosition, aEndPosition, aColorStart, aColorEnd, aRandomOffset
- Uniforms: uProgress, uTime, uSmoothColors, uGrayscale, uTransitionMode, uPointSize, uOpacity, uBrightness, uSaturation, uHueShift, uMouse, uMouseMode, uMouseRadius, uMouseStrength

**Vertex Shader**
- Position interpolation with cubic easing
- Per-particle delay via `aRandomOffset * MAX_DELAY`
- Four transition effects controlled by `uTransitionMode`:
  - Mode 0 (Default): Chaos/swirl noise during transition
  - Mode 1 (Spiral Vortex): Rotating particles around center axis with Z-wave
  - Mode 2 (Explosion): Radial burst outward then reform
  - Mode 3 (Reverse Gravity): Upward float like fireworks
- Mouse interaction (attract/repel)
- Color blending based on progress

**Fragment Shader**
- Circular particles with soft edges
- Alpha falloff via smoothstep
- Brightness multiplier
- Saturation adjustment via grayscale luminance mix
- Hue shift via RGB↔HSV conversion

### Animation Flow

1. User adds images via button or drag & drop → `addImage()` extracts pixel data
2. `getImageBuffers()` converts to position/color arrays
3. Images stored in `images[]` array with position, color, URL, and name
4. Click Start → `swapBuffers()` sets start/end attributes from consecutive images
5. `animate()` increments progress, cycles to next image on completion if looping

### Key Variables

| Variable | Purpose |
|----------|---------|
| `PARTICLE_COUNT` | 100000 - total particles |
| `images` | Array of {pos, col, url, name} for all loaded images |
| `currentIndex` | Index of currently displayed image in the array |
| `morphSpeed` | 0.012 (default) - progress increment per frame, adjustable via slider |
| `MAX_DELAY` | 0.3 - max stagger delay (30% of progress) |
| `PAUSE_DURATION` | 120 frames between morphs in loop mode |
| `imageScale` | 0.9 - scale factor for particle images |
| `pointSize` | 3.0 (default) - particle point size |
| `zDepth` | 2.0 (default) - Z-axis spread for particles |
| `hueShift` | 0 (default) - hue rotation 0-1 (mapped from 0-360°) |
| `autoMode` | false - auto-adjust settings based on background |
| `transitionMode` | 0-3 - transition effect (default/spiral/explosion/gravity) |
| `mouseMode` | 0-2 - mouse interaction (off/attract/repel) |

### Key Functions

| Function | Purpose |
|----------|---------|
| `setupImageHandlers()` | Initialize multi-image UI event listeners |
| `addImage(file)` | Process and add image to the images array |
| `removeImage(index)` | Remove image from array, revoke URL, update UI |
| `updateImageList()` | Re-render the image list UI |
| `displayImage(index)` | Show specific image in particle system |
| `swapBuffers()` | Set up morph from current to next image |
| `getLuminance(hexColor)` | Calculate perceived brightness of hex color |
| `applyAutoSettings(hexColor)` | Auto-adjust blend/saturation/opacity based on BG |
| `applyPreset(name)` | Apply named preset configuration |
| `takeScreenshot()` | Capture current frame as PNG download |
| `setupDragAndDrop()` | Initialize drag & drop for image upload |
| `setupTouchSupport()` | Initialize touch event handlers |
| `reprocessImages()` | Re-scale all images when scale slider changes |
| `updateCanvasSize()` | Resize canvas when width/height sliders change |
| `cleanup()` | Cancel animation, revoke all URLs, dispose Three.js resources |

## Dependencies

- Three.js 0.160.0 (loaded via importmap from unpkg CDN)

## Development Notes

- Self-contained HTML file - no build step required
- Uses ES modules for Three.js import
- No external CSS or JS files needed
- Images processed via canvas getImageData()
- Object URLs used for image loading (cleaned up on page unload or image removal)
- Compact UI with max-height and overflow scroll for smaller screens
- Keyboard shortcuts: Space (play/pause), Escape (toggle UI)
- Loading spinner shown during image processing
- WebGL context loss/recovery handled gracefully
- Multi-image support with dynamic list UI
- Drag & drop support for multiple images at once
- Touch support: tap (attract), long press (repel)
- Screenshot capture via canvas toDataURL
- 6 visual presets with full parameter sets

## Potential Enhancements

- Image reordering via drag & drop in list
- Customizable particle count via UI
- Export animation as video/GIF
- Additional transition effects
- Audio reactive mode
