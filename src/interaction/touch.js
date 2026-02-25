/**
 * Touch interaction handling
 */
import { state } from '../state/store.js';

const LONG_PRESS_DURATION = 500;

/**
 * Set up touch interaction handlers
 */
export function setupTouchInteraction() {
  const { renderer, boundHandlers } = state;
  if (!renderer) return;

  const canvas = renderer.domElement;
  let touchStartTime = 0;

  const touchStartHandler = (e) => {
    touchStartTime = Date.now();

    // Start long press timer
    state.timeouts.touch = setTimeout(() => {
      // Long press = repel mode
      state.settings.mouseMode = 2;
      if (state.particles) {
        state.particles.material.uniforms.uMouseMode.value = 2;
      }
    }, LONG_PRESS_DURATION);

    // Handle touch position
    handleTouchPosition(e);
  };

  const touchEndHandler = () => {
    clearTimeout(state.timeouts.touch);
    const duration = Date.now() - touchStartTime;

    if (duration < LONG_PRESS_DURATION) {
      // Short tap = attract mode briefly
      state.settings.mouseMode = 1;
      if (state.particles) {
        state.particles.material.uniforms.uMouseMode.value = 1;
      }

      // Clear any existing attract timeout
      if (state.timeouts.attract) {
        clearTimeout(state.timeouts.attract);
      }

      // Reset after 1 second
      state.timeouts.attract = setTimeout(() => {
        state.settings.mouseMode = 0;
        if (state.particles) {
          state.particles.material.uniforms.uMouseMode.value = 0;
        }
      }, 1000);
    } else {
      // Long press ended = reset mode
      state.settings.mouseMode = 0;
      if (state.particles) {
        state.particles.material.uniforms.uMouseMode.value = 0;
      }
    }
  };

  const touchMoveHandler = (e) => {
    // Cancel long press if moved
    clearTimeout(state.timeouts.touch);
    handleTouchPosition(e);
  };

  canvas.addEventListener('touchstart', touchStartHandler, { passive: true });
  canvas.addEventListener('touchend', touchEndHandler, { passive: true });
  canvas.addEventListener('touchmove', touchMoveHandler, { passive: true });

  boundHandlers.touchHandlers = [touchStartHandler, touchEndHandler, touchMoveHandler];
}

/**
 * Handle touch position update
 */
function handleTouchPosition(e) {
  if (!e.touches || e.touches.length === 0) return;

  const touch = e.touches[0];
  const rect = state.renderer.domElement.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  // Convert to normalized device coordinates
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
}

/**
 * Remove touch interaction handlers
 */
export function removeTouchInteraction() {
  const { renderer, boundHandlers } = state;

  if (renderer && boundHandlers.touchHandlers.length > 0) {
    const touchEvents = ['touchstart', 'touchend', 'touchmove'];
    touchEvents.forEach((event, i) => {
      if (boundHandlers.touchHandlers[i]) {
        renderer.domElement.removeEventListener(event, boundHandlers.touchHandlers[i]);
      }
    });
    boundHandlers.touchHandlers = [];
  }

  // Clear timeouts
  if (state.timeouts.touch) {
    clearTimeout(state.timeouts.touch);
    state.timeouts.touch = null;
  }
  if (state.timeouts.attract) {
    clearTimeout(state.timeouts.attract);
    state.timeouts.attract = null;
  }
}
