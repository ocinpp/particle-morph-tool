# Learning Guide - Particle Morph Tool

This document covers all the concepts, techniques, and patterns you can learn from studying this project.

## Table of Contents

1. [Three.js Fundamentals](#threejs-fundamentals)
2. [GLSL Shaders](#glsl-shaders)
3. [Particle Systems](#particle-systems)
4. [Animation Techniques](#animation-techniques)
5. [Mouse Interaction](#mouse-interaction)
6. [Color Theory in Shaders](#color-theory-in-shaders)
7. [Memory Management](#memory-management)
8. [JavaScript Patterns](#javascript-patterns)
9. [CSS/UI Techniques](#cssui-techniques)
10. [Mathematical Concepts](#mathematical-concepts)

---

## Three.js Fundamentals

### Scene Setup

```javascript
// Create a scene - the container for all 3D objects
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// Create a perspective camera
// Parameters: FOV (degrees), aspect ratio, near plane, far plane
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
camera.position.z = 500;  // Move camera back to see objects at origin

// Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);  // For sharp rendering on HiDPI displays
```

**Key Learnings:**
- The camera's z-position determines how "zoomed in" the view is
- `devicePixelRatio` ensures crisp rendering on Retina displays
- Objects at z=0 need the camera to be positioned back (positive z) to be visible

### Import Maps (ES Modules)

```html
<script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js"
    }
  }
</script>

<script type="module">
  import * as THREE from "three";
</script>
```

**Key Learnings:**
- Import maps allow bare module specifiers in browsers
- No build step (bundler) required for simple projects
- Uses ES modules (`type="module"`) instead of UMD scripts

---

## GLSL Shaders

### Vertex Shader Basics

The vertex shader runs once per vertex (particle) and determines position.

```glsl
// Attributes - per-vertex data from BufferGeometry
attribute vec3 aStartPosition;
attribute vec3 aEndPosition;
attribute vec3 aColorStart;
attribute vec3 aColorEnd;
attribute float aRandomOffset;

// Uniforms - global values passed from JavaScript
uniform float uProgress;
uniform float uTime;

// Varyings - data passed to fragment shader (interpolated)
varying vec3 vColor;

void main() {
    // Calculate position based on progress
    vec3 pos = mix(aStartPosition, aEndPosition, uProgress);

    // Transform to clip space
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Calculate point size (perspective-correct)
    gl_PointSize = 3.0 * (300.0 / -mvPosition.z);

    // Pass color to fragment shader
    vColor = mix(aColorStart, aColorEnd, uProgress);
}
```

**Key Learnings:**
- `gl_Position` is the required output - position in clip space
- `gl_PointSize` controls particle size (only for `THREE.Points`)
- Division by `-mvPosition.z` creates perspective (farther = smaller)
- `varying` variables are interpolated between vertices

### Fragment Shader Basics

The fragment shader runs once per pixel and determines color.

```glsl
varying vec3 vColor;  // Received from vertex shader (interpolated)
uniform float uOpacity;
uniform float uBrightness;
uniform float uSaturation;

void main() {
    // Create circular particles from square point sprites
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;  // Discard pixels outside circle

    // Soft edges using smoothstep
    float alpha = (1.0 - smoothstep(0.3, 0.5, dist)) * uOpacity;

    // Apply brightness
    vec3 color = vColor * uBrightness;

    // Apply saturation
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(gray), color, uSaturation);

    gl_FragColor = vec4(color, alpha);
}
```

**Key Learnings:**
- `gl_PointCoord` gives UV coordinates within each point sprite (0-1)
- `discard` removes pixels entirely (no depth write)
- `smoothstep(edge0, edge1, x)` creates smooth transitions
- `mix(a, b, t)` linearly interpolates: `a * (1-t) + b * t`

### Built-in GLSL Functions

| Function | Description |
|----------|-------------|
| `mix(a, b, t)` | Linear interpolation |
| `smoothstep(e0, e1, x)` | Smooth interpolation (Hermite) |
| `clamp(x, min, max)` | Constrain value to range |
| `length(v)` | Vector magnitude |
| `dot(a, b)` | Dot product |
| `fract(x)` | Fractional part |
| `sin(x)`, `cos(x)` | Trigonometry |
| `atan(y, x)` | Arc tangent (returns angle) |
| `normalize(v)` | Convert to unit vector |

---

## Particle Systems

### BufferGeometry with Custom Attributes

```javascript
const geometry = new THREE.BufferGeometry();

// Create typed arrays for particle data
const positions = new Float32Array(PARTICLE_COUNT * 3);  // x, y, z per particle
const colors = new Float32Array(PARTICLE_COUNT * 3);     // r, g, b per particle
const randomOffsets = new Float32Array(PARTICLE_COUNT);  // 1 value per particle

// Set attributes on geometry
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("aColorStart", new THREE.BufferAttribute(colors, 3));
geometry.setAttribute("aRandomOffset", new THREE.BufferAttribute(randomOffsets, 1));

// Update attributes efficiently
geometry.attributes.position.needsUpdate = true;
```

**Key Learnings:**
- `Float32Array` is more efficient than regular arrays for GPU data
- Second parameter to `BufferAttribute` is components per vertex (3 for vec3, 1 for float)
- Setting `needsUpdate = true` tells Three.js to upload new data to GPU
- Attribute names starting with `a` (like `aColorStart`) avoid conflicts with built-ins

### Points vs Mesh

```javascript
// Points renders each vertex as a square sprite (or circle via shader)
const particles = new THREE.Points(geometry, material);

// Mesh would connect vertices into triangles
const mesh = new THREE.Mesh(geometry, material);
```

**Key Learnings:**
- `THREE.Points` is optimized for rendering many small sprites
- Each vertex becomes one particle
- Fragment shader can shape them into circles using `gl_PointCoord`

---

## Animation Techniques

### Easing Functions

```glsl
// Cubic ease-in-out (slow start, fast middle, slow end)
float easeInOutCubic(float t) {
    return t < 0.5
        ? 4.0 * t * t * t
        : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}
```

**Common Easing Types:**
- **Linear**: `t` (constant speed)
- **Ease-in**: `t * t` (slow start)
- **Ease-out**: `1 - (1-t) * (1-t)` (slow end)
- **Ease-in-out**: Combination of both

### Staggered Animation

```javascript
// Assign random offset to each particle
for (let i = 0; i < PARTICLE_COUNT; i++) {
    randomOffsets[i] = Math.random();
}
```

```glsl
// In shader, delay each particle differently
float delay = aRandomOffset * MAX_DELAY;  // 0 to 0.3
float p = clamp(uProgress - delay, 0.0, 1.0);  // Shifted progress
```

**Key Learnings:**
- Staggering creates organic, wave-like effects
- `Math.random()` in JS → store in attribute → use in shader
- `MAX_DELAY` of 0.3 means last particles start when progress is 30%

### Animation Loop Pattern

```javascript
let progress = 0;
const MORPH_SPEED = 0.012;  // Progress per frame

function animate() {
    requestAnimationFrame(animate);

    if (isPlaying && progress < 1.0 + MAX_DELAY) {
        progress += MORPH_SPEED;
        particles.material.uniforms.uProgress.value = progress;
    }

    renderer.render(scene, camera);
}
```

**Key Learnings:**
- `requestAnimationFrame` syncs to monitor refresh rate (~60fps)
- Progress goes slightly past 1.0 to account for stagger delays
- Update uniforms to pass values to shaders each frame

### Transition Effects in Shaders

The vertex shader supports multiple transition effects controlled by a uniform:

```glsl
uniform float uTransitionMode;  // 0=default, 1=spiral, 2=explosion, 3=gravity

// Apply effect based on mode
if (uTransitionMode < 0.5) {
    // DEFAULT: chaos/swirl effect
    float chaosPower = sin(p * 3.14159) * 1.5;
    vec3 swirl = vec3(noise(...), noise(...), noise(...));
    pos += (swirl - 0.5) * chaosPower * aRandomOffset;
} else if (uTransitionMode < 1.5) {
    // SPIRAL VORTEX: rotate around center
    float angle = p * 6.28 * 2.0;  // 2 full rotations
    float radius = length(pos.xy);
    float originalAngle = atan(pos.y, pos.x);
    pos.x = radius * cos(originalAngle + angle);
    pos.y = radius * sin(originalAngle + angle);
    pos.z += sin(p * 3.14159) * 50.0 * aRandomOffset;
} else if (uTransitionMode < 2.5) {
    // EXPLOSION: burst outward
    float power = sin(p * 3.14159) * 200.0 * aRandomOffset;
    vec3 dir = normalize(pos + vec3(0.001));
    pos += dir * power;
} else {
    // REVERSE GRAVITY: float upward
    float peak = sin(p * 3.14159);
    vec3 up = vec3(pos.x * 0.3, 100.0, pos.z * 0.3);
    pos += up * peak * aRandomOffset;
}
```

**Key Learnings:**
- Use `if/else` with float comparisons for mode selection in GLSL
- `sin(p * 3.14159)` creates a smooth 0→1→0 curve peaking at p=0.5
- Polar coordinates (radius, angle) enable rotation effects
- `normalize()` creates direction vectors for radial effects
- `aRandomOffset` adds per-particle variation to effects

---

## Mouse Interaction

### Screen to World Coordinates

```javascript
// Convert mouse position to 3D world coordinates
const mouse = new THREE.Vector2();
const mouseWorld = new THREE.Vector3();

document.addEventListener("mousemove", (e) => {
    // Normalize to -1 to 1 range
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Project to z-plane where particles live
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    mouseWorld.copy(camera.position).add(dir.multiplyScalar(distance));
});
```

**Key Learnings:**
- `unproject()` converts screen coordinates to 3D ray
- Divide by `dir.z` to find where ray intersects the particle plane
- Mouse position updates are throttled for performance

### Shader Mouse Effect

```glsl
uniform vec3 uMouse;
uniform float uMouseMode;     // 0=off, 1=attract, 2=repel
uniform float uMouseRadius;
uniform float uMouseStrength;

// In vertex shader
if (uMouseMode > 0.5) {
    vec3 toMouse = pos - uMouse;
    float dist = length(toMouse);
    if (dist < uMouseRadius && dist > 0.001) {
        float strength = (1.0 - dist / uMouseRadius) * uMouseStrength;
        vec3 direction = normalize(toMouse);
        // Mode 1 = attract (toward), Mode 2 = repel (away)
        pos += direction * strength * (uMouseMode > 1.5 ? 1.0 : -1.0);
    }
}
```

**Key Learnings:**
- Distance falloff creates smooth interaction boundaries
- `normalize()` ensures consistent strength regardless of distance
- Mode selection uses same pattern as transition effects

---

## Color Theory in Shaders

### Luminance Calculation

```javascript
// Perceived brightness (human eyes are most sensitive to green)
function getLuminance(hexColor) {
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;  // ITU-R BT.601
}
```

### Saturation Adjustment

```glsl
// Convert to grayscale, then mix back with original
float gray = dot(color, vec3(0.299, 0.587, 0.114));  // Luminance
vec3 grayscale = vec3(gray);

// Saturation = 0: fully grayscale
// Saturation = 1: original color
// Saturation > 1: boosted color (more vibrant)
vec3 result = mix(grayscale, color, uSaturation);
```

**Key Learnings:**
- Standard luminance weights: R=0.299, G=0.587, B=0.114
- `saturation > 1` boosts color intensity without changing brightness
- This technique preserves colors on light backgrounds

### Brightness vs Saturation

| Operation | Effect | Use Case |
|-----------|--------|----------|
| Brightness (multiply) | Makes colors lighter but also washes them out | Dark backgrounds |
| Saturation (grayscale mix) | Makes colors more/less intense | Light backgrounds |

---

## Memory Management

### Object URL Cleanup

```javascript
let objectUrlA = null;

function handleImageUpload(event, type) {
    // Revoke old URL to free memory
    if (objectUrlA) {
        URL.revokeObjectURL(objectUrlA);
    }

    // Create new URL
    objectUrlA = URL.createObjectURL(file);

    // Use URL for image loading
    img.src = objectUrlA;
}

// Clean up on page unload
window.addEventListener("beforeunload", cleanup);
```

**Key Learnings:**
- `URL.createObjectURL()` creates a blob URL that must be manually freed
- Without cleanup, memory leaks occur when uploading many images
- `beforeunload` event ensures cleanup even if user closes tab

### Three.js Resource Disposal

```javascript
function cleanup() {
    if (particles) {
        particles.geometry.dispose();
        particles.material.dispose();
    }
    if (renderer) {
        renderer.dispose();
    }
}
```

**Key Learnings:**
- Three.js stores data in GPU memory that must be explicitly freed
- `geometry.dispose()` frees vertex buffers
- `material.dispose()` frees shader programs and textures
- `renderer.dispose()` frees WebGL context resources

---

## JavaScript Patterns

### Event Listener Pattern

```javascript
// Store DOM elements and attach listeners in init()
document.getElementById("slider").addEventListener("input", (e) => {
    const value = e.target.value / 100;  // Normalize to 0-1
    document.getElementById("value").textContent = e.target.value + "%";
    if (particles) {
        particles.material.uniforms.uValue.value = value;
    }
});
```

### State Management

```javascript
// Global state variables
let isPlaying = false;
let loopMode = true;
let progress = 0;
let currentTarget = "B";

// Cached data
let cachedPosA = null;
let cachedColA = null;

// Functions update state and UI
function updateUI() {
    btn.innerText = isPlaying ? "STOP" : "START LOOP";
    btn.className = isPlaying ? "action-btn stop-state" : "action-btn start-state";
}
```

### Canvas Image Processing

```javascript
function getImageBuffers(imgData) {
    const pixels = imgData.data;  // Uint8ClampedArray: [r,g,b,a, r,g,b,a, ...]
    const width = imgData.width;
    const height = imgData.height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;  // Index into pixel array

            // Access RGBA
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];  // Alpha channel

            // Skip transparent pixels
            if (a < 128) continue;

            // Process visible pixel...
        }
    }
}
```

**Key Learnings:**
- `getImageData()` returns a flat array: [r,g,b,a, r,g,b,a, ...]
- Index formula: `(y * width + x) * 4`
- Alpha threshold (128) determines which pixels become particles

---

## CSS/UI Techniques

### Collapsible Panel

```css
#ui {
    transform: translateX(0);
    transition: transform 0.3s ease, opacity 0.3s ease;
}

#ui.hidden {
    transform: translateX(-110%);  /* Move off-screen */
    opacity: 0;
    pointer-events: none;  /* Allow clicks through */
}
```

### Custom Toggle Switch

```css
.switch {
    position: relative;
    width: 40px;
    height: 20px;
}

.slider {
    position: absolute;
    inset: 0;
    background-color: #555;
    border-radius: 20px;
    transition: 0.4s;
}

.slider:before {
    content: "";
    position: absolute;
    width: 14px;
    height: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
}

input:checked + .slider {
    background-color: #0af;
}

input:checked + .slider:before {
    transform: translateX(20px);
}
```

### Custom Range Slider

```css
input[type="range"] {
    -webkit-appearance: none;  /* Remove default styling */
    height: 4px;
    background: #444;
    border-radius: 2px;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #0af;
    border-radius: 50%;
    cursor: pointer;
}
```

### Responsive Scrollable Panel

```css
#ui {
    max-height: calc(100vh - 20px);
    overflow-y: auto;
}
```

---

## Mathematical Concepts

### Coordinate Mapping

```javascript
// Map image coordinates (pixels) to 3D space
pos[i3] = (x - centerX) * scale;      // X: center horizontally
pos[i3 + 1] = -(y - centerY) * scale; // Y: flip (image Y is inverted)
pos[i3 + 2] = (Math.random() - 0.5) * 2.0;  // Z: slight depth variation
```

### Field of View Scaling

```javascript
// Calculate visible height at camera distance
const vFov = THREE.MathUtils.degToRad(camera.fov);  // Convert to radians
const vHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
const vWidth = vHeight * camera.aspect;

// Scale image to fit
const scaleX = vWidth / contentWidth;
const scaleY = vHeight / contentHeight;
const scale = Math.min(scaleX, scaleY) * imageScale;  // Fit within view
```

### Noise Function (GLSL)

```glsl
// Pseudo-random noise from 3D position
float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
}
```

**Key Learnings:**
- This is a simple hash function, not Perlin noise
- `dot` product combines coordinates into one value
- `sin` creates variation, `fract` keeps result in 0-1 range
- Magic numbers are arbitrary constants that produce good distribution

---

## Further Reading

### Three.js
- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Fundamentals](https://threejs.org/manual/)

### GLSL/Shaders
- [The Book of Shaders](https://thebookofshaders.com/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Shader Toy](https://www.shadertoy.com/) (live shader playground)

### Animation
- [Easing Functions Cheat Sheet](https://easings.net/)
- [GreenSock (GSAP)](https://greensock.com/) (advanced animation library)

### Color
- [Color Theory for Designers](https://www.smashingmagazine.com/2010/01/color-theory-for-designers-part-1-the-essentials/)
- [HSL Color Picker](https://hslpicker.com/)
