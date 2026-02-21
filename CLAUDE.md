# Particle Morph Tool - Claude Context

## Project Overview

Single-file Three.js application for particle morphing effects between two images.

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
- Uniforms: uProgress, uTime, uSmoothColors, uGrayscale, uTransitionMode, uOpacity, uBrightness, uSaturation, uMouse, uMouseMode, uMouseRadius, uMouseStrength

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

### Animation Flow

1. User uploads images → `handleImageUpload()` extracts pixel data
2. `getImageBuffers()` converts to position/color arrays
3. Click Start → `swapBuffers()` sets start/end attributes
4. `animate()` increments progress, swaps on completion if looping

### Key Variables

| Variable | Purpose |
|----------|---------|
| `PARTICLE_COUNT` | 100000 - total particles |
| `MORPH_SPEED` | 0.012 - progress increment per frame |
| `MAX_DELAY` | 0.3 - max stagger delay (30% of progress) |
| `PAUSE_DURATION` | 120 frames between morphs in loop mode |
| `imageScale` | 0.9 - scale factor for particle images |
| `autoMode` | false - auto-adjust settings based on background |
| `transitionMode` | 0-3 - transition effect (default/spiral/explosion/gravity) |
| `mouseMode` | 0-2 - mouse interaction (off/attract/repel) |

### Key Functions

| Function | Purpose |
|----------|---------|
| `getLuminance(hexColor)` | Calculate perceived brightness of hex color |
| `applyAutoSettings(hexColor)` | Auto-adjust blend/saturation/opacity based on BG |
| `reprocessImages()` | Re-scale images when scale slider changes |
| `updateCanvasSize()` | Resize canvas when width/height sliders change |
| `cleanup()` | Cancel animation, revoke URLs, dispose Three.js resources, force WebGL context loss |

## Dependencies

- Three.js 0.160.0 (loaded via importmap from unpkg CDN)

## Development Notes

- Self-contained HTML file - no build step required
- Uses ES modules for Three.js import
- No external CSS or JS files needed
- Images processed via canvas getImageData()
- Object URLs used for image loading (cleaned up on page unload)
- Compact UI with max-height and overflow scroll for smaller screens

## Potential Enhancements

- Support for more than 2 images
- Customizable particle count via UI
- Export animation as video/GIF
- Touch/mobile gesture support
- Additional transition effects
