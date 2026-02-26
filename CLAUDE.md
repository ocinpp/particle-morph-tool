# Particle Morph Tool - Claude Context

## Project Overview

Modular Three.js application for particle morphing effects between multiple images, built with Vite for modern development workflow.

## File Structure

```
particles-effects/
├── index.html              # Entry point HTML
├── src/
│   ├── main.js             # Application entry point
│   ├── style.css           # Global styles
│   ├── core/               # Three.js core modules
│   │   ├── constants.js    # Application constants
│   │   ├── scene.js        # Scene, camera, renderer setup
│   │   ├── particles.js    # Particle system and geometry
│   │   └── animation.js    # Animation loop and morphing
│   ├── shaders/
│   │   ├── vertex.glsl     # Vertex shader
│   │   └── fragment.glsl   # Fragment shader
│   ├── image/
│   │   ├── processor.js    # Image pixel extraction
│   │   ├── manager.js      # Image list management
│   │   └── storage.js      # IndexedDB persistence
│   ├── state/
│   │   ├── store.js        # Global state management
│   │   └── settings.js     # Settings persistence (localStorage)
│   ├── ui/
│   │   ├── controls.js     # UI control handlers
│   │   ├── presets.js      # Preset configurations
│   │   └── imageList.js    # Image list UI
│   └── interaction/
│       ├── mouse.js        # Mouse interaction
│       ├── touch.js        # Touch event handling
│       ├── dragdrop.js     # Drag & drop support
│       └── keyboard.js     # Keyboard shortcuts
├── morph.html              # Original single-file version (reference)
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── vitest.config.js        # Test configuration
├── eslint.config.js        # Linting rules
├── tsconfig.json           # TypeScript config (for IDE support)
├── README.md               # User documentation
├── CLAUDE.md               # This file
└── .agents/                # AI assistant skills for this project
    └── skills/
        ├── brainstorming/       # Design exploration before implementation
        ├── frontend-design/     # UI/UX design patterns
        ├── threejs-fundamentals/# Three.js scene setup, cameras, renderers
        ├── threejs-animation/   # Keyframe, skeletal, morph target animation
        ├── threejs-shaders/     # GLSL, ShaderMaterial, custom effects
        └── web-design-guidelines/# Web accessibility and UX best practices
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
- Uniforms: uProgress, uTime, uSmoothColors, uGrayscale, uTransitionMode, uPointSize, uOpacity, uBrightness, uSaturation, uHueShift, uInvert, uMouse, uMouseMode, uMouseRadius, uMouseStrength

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
- Color inversion toggle

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
| `pauseDuration` | 120 (default) - frames between morphs in loop mode, adjustable via slider |
| `imageScale` | 0.9 - scale factor for particle images |
| `pointSize` | 3.0 (default) - particle point size |
| `zDepth` | 2.0 (default) - Z-axis spread for particles |
| `hueShift` | 0 (default) - hue rotation 0-1 (mapped from 0-360°) |
| `invertColors` | false - invert all colors in fragment shader |
| `autoRotate` | false - enable particle rotation |
| `rotateMode` | 0-2 - rotation mode (continuous/oscillate/morph-only) |
| `rotateAxis` | 'y' - rotation axis (x/y/z/xy/xyz) |
| `rotateSpeed` | 0.5 (default) - rotation speed in degrees per second |
| `rotateRange` | 180 (default) - max rotation angle for oscillate mode |
| `rotatePivot` | 0 (default) - pivot offset percentage (0=center, 100=orbital) |
| `autoMode` | false - auto-adjust settings based on background |
| `transitionMode` | 0-3 - transition effect (default/spiral/explosion/gravity) |
| `easingMode` | 0-5 - easing curve (ease-in-out/linear/ease-in/ease-out/bounce/elastic) |
| `mouseMode` | 0-2 - mouse interaction (off/attract/repel) |
| `mouseRadius` | 150 (default) - radius of mouse interaction effect |
| `mouseStrength` | 3.0 (default) - strength of mouse interaction |
| `showFPS` | false - show FPS counter in bottom right corner |
| `additiveBlend` | true - use additive blending for glow effect |
| `opacity` | 100 (default) - particle opacity percentage |
| `brightness` | 100 (default) - particle brightness percentage |
| `saturation` | 100 (default) - color saturation percentage |

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
| `cleanup()` | Cancel animation, revoke all URLs, dispose Three.js resources, close IndexedDB |
| `saveSettings()` | Save all settings to localStorage |
| `loadSettings()` | Load settings from localStorage and apply to UI |
| `resetSettings()` | Reset all settings to default values and persist to localStorage |
| `updatePresetButtons()` | Update canvas preset button active states |
| `openImageDB()` | Open/create IndexedDB for image persistence |
| `saveImageToDB(blob, id)` | Save image blob to IndexedDB |
| `deleteImageFromDB(id)` | Delete image from IndexedDB |
| `loadImagesFromDB()` | Load all saved images from IndexedDB |

## AI Assistant Skills

This repository includes specialized skills for AI assistants working on this project:

| Skill | Purpose |
|-------|---------|
| `threejs-shaders` | GLSL shaders, ShaderMaterial, uniforms, custom effects |
| `threejs-animation` | Keyframe animation, skeletal animation, morph targets |
| `threejs-fundamentals` | Scene setup, cameras, renderer, Object3D hierarchy |
| `frontend-design` | UI/UX design patterns and component architecture |
| `brainstorming` | Design exploration and requirements gathering |
| `web-design-guidelines` | Accessibility and UX best practices |

These skills are automatically available when using Claude Code in this project.

## Dependencies

- Three.js (via npm, bundled with Vite)
- Vite (build tool and dev server)

## Development Notes

- **Build System**: Vite for fast HMR and optimized production builds
- **ES Modules**: Modern JavaScript modules throughout
- **GLSL Imports**: Shaders imported as raw text via Vite plugin
- **Testing**: Vitest for unit tests
- **Linting**: ESLint with modern flat config
- Images processed via canvas getImageData()
- Object URLs used for image loading (cleaned up on page unload or image removal)
- Compact UI with max-height and overflow scroll for smaller screens
- Keyboard shortcuts: Space (play/pause), Escape (toggle UI), F (fullscreen)
- Settings persistence via localStorage (auto-save with visual indicator)
- Image persistence via IndexedDB (images and file names restored on reload)
- Auto-save indicator (green dot flashes when settings saved)
- Image reordering via drag & drop in list
- FPS counter toggle for performance monitoring (bottom right)
- Reset settings button with confirmation dialog
- Loading spinner shown during image processing
- WebGL context loss/recovery handled gracefully
- Multi-image support with dynamic list UI
- Drag & drop support for multiple images at once
- Touch support: tap (attract), long press (repel)
- Screenshot capture via canvas toDataURL
- 6 visual presets with full parameter sets
- Adjustable pause duration between morphs
- Color inversion toggle
- Auto-rotate mode with adjustable speed
- Mouse interaction with configurable radius and strength

## Known Implementation Details

**Mouse World Position Calculation** (`src/interaction/mouse.js`):
- Screen coordinates are converted to NDC (-1 to 1), then unprojected to world coordinates
- Uses `Vector3.set(x, y, 0.5)` before unproject - the z=0.5 is required for proper NDC-to-world conversion
- The world position is calculated by finding the intersection of the mouse ray with the z=0 plane (particle plane)

## Memory Management

The application implements comprehensive cleanup to prevent memory leaks:

**Tracked and Cleaned:**
- Animation frame (cancelled on cleanup)
- Object URLs (revoked on image removal and cleanup)
- Event listeners for resize, mousemove, visibility, keydown, WebGL context, drag & drop, touch
- Timeouts for save indicator, touch interactions, and debounced settings save
- Three.js resources (geometry, material, renderer disposed)
- IndexedDB connection (closed on cleanup)
- AbortController for image reprocessing (aborted on cleanup)
- Processing canvas (cleaned up on page unload)

**Implementation Notes:**
- Preset buttons use attribute selectors (`[data-width]`, `[data-preset]`) to separate canvas and visual preset handlers
- `resetSettings()` persists changes to localStorage and updates all UI states including preset buttons
- Screenshot timeouts are short-lived (100-2000ms) and DOM-only, cleaned up naturally by browser on page unload

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (localhost:3000) |
| `npm run build` | Build for production (outputs to dist/) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |

## Potential Enhancements

- Customizable particle count via UI
- Export animation as video/GIF
- Additional transition effects
- Audio reactive mode
