/**
 * Mouse interaction handling
 */
import { state } from '../state/store.js';
import { MOUSE_THROTTLE } from '../core/constants.js';

/**
 * Set up mouse interaction handlers
 */
export function setupMouseInteraction() {
  const { renderer, boundHandlers } = state;
  if (!renderer) return;

  const canvas = renderer.domElement;

  const mouseMoveHandler = (e) => {
    const now = performance.now();
    if (now - state.lastMouseUpdate < MOUSE_THROTTLE) return;
    state.lastMouseUpdate = now;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to normalized device coordinates (-1 to 1)
    state.mouse.x = (x / rect.width) * 2 - 1;
    state.mouse.y = -(y / rect.height) * 2 + 1;

    // Convert to world coordinates
    const vector = state.mouseVector.copy(state.mouse);
    vector.unproject(state.camera);

    const dir = vector.sub(state.camera.position).normalize();
    const distance = -state.camera.position.z / dir.z;
    const pos = state.camera.position.clone().add(dir.multiplyScalar(distance));

    if (state.particles && state.particles.material.uniforms.uMouse) {
      state.particles.material.uniforms.uMouse.value.copy(pos);
    }
  };

  canvas.addEventListener('mousemove', mouseMoveHandler);
  boundHandlers.mouseMove = mouseMoveHandler;
}

/**
 * Remove mouse interaction handlers
 */
export function removeMouseInteraction() {
  const { renderer, boundHandlers } = state;
  if (renderer && boundHandlers.mouseMove) {
    renderer.domElement.removeEventListener('mousemove', boundHandlers.mouseMove);
    boundHandlers.mouseMove = null;
  }
}

/**
 * Update mouse mode
 * @param {number} mode - 0=off, 1=attract, 2=repel
 */
export function setMouseMode(mode) {
  state.settings.mouseMode = mode;
  if (state.particles) {
    state.particles.material.uniforms.uMouseMode.value = mode;
  }
}

/**
 * Update mouse radius
 * @param {number} radius - Interaction radius in pixels
 */
export function setMouseRadius(radius) {
  state.settings.mouseRadius = radius;
  if (state.particles) {
    state.particles.material.uniforms.uMouseRadius.value = radius;
  }
}

/**
 * Update mouse strength
 * @param {number} strength - Interaction strength (0-1)
 */
export function setMouseStrength(strength) {
  state.settings.mouseStrength = strength;
  if (state.particles) {
    state.particles.material.uniforms.uMouseStrength.value = strength;
  }
}
