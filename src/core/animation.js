/**
 * Animation loop and particle animation logic
 */
// THREE is used for type annotations only
// import * as THREE from 'three';
import { state, MAX_DELAY } from '../state/store.js';
import { swapBuffers } from './particles.js';

/**
 * Main animation loop
 */
export function animate() {
  state.animationFrameId = requestAnimationFrame(animate);

  const { settings } = state;

  // FPS calculation
  if (settings.showFPS) {
    state.frameCount++;
    const now = performance.now();
    if (now - state.lastFrameTime >= 1000) {
      state.fps = state.frameCount;
      state.frameCount = 0;
      state.lastFrameTime = now;
      const fpsCounter = document.getElementById('fpsCounter');
      if (fpsCounter) {
        fpsCounter.textContent = state.fps + ' FPS';
      }
    }
  }

  // Skip rendering when tab is hidden
  if (!state.isTabVisible) return;

  const particles = state.particles;
  if (!particles) return;

  // Only update time if playing or mouse interaction is active
  if (state.isPlaying || settings.mouseMode !== 0) {
    particles.material.uniforms.uTime.value += 0.01;
    state.needsRender = true;
  }

  if (state.isPlaying) {
    if (state.progress < 1.0 + MAX_DELAY) {
      state.progress += settings.morphSpeed;
    } else {
      if (settings.loopMode) {
        state.pauseCounter++;
        if (state.pauseCounter % 30 === 0 && state.pauseCounter <= settings.pauseDuration) {
          updateStatus('Pausing...');
        }

        if (state.pauseCounter >= settings.pauseDuration) {
          state.pauseCounter = 0;
          swapBuffers();
        }
      } else {
        state.isPlaying = false;
        updateButtonUI();
        updateStatus('Finished');
      }
    }
    particles.material.uniforms.uProgress.value = state.progress;
    state.needsRender = true;
  }

  // Auto-rotate particles
  if (settings.autoRotate && particles) {
    const speedFactor = settings.rotateSpeed * 0.01 * (settings.morphSpeed / 0.012);
    const shouldRotate = settings.rotateMode === 2 ? state.isPlaying : true; // Morph-only mode

    if (shouldRotate) {
      // Handle pivot offset
      if (settings.rotatePivot > 0) {
        const offset = settings.rotatePivot * 2; // Scale to reasonable range
        particles.position.x = offset * Math.sin(state.rotationTime * speedFactor);
        particles.position.y = offset * Math.cos(state.rotationTime * speedFactor);
      }

      if (settings.rotateMode === 1) {
        // Oscillate mode - use sine wave for back-and-forth
        state.rotationTime += 0.05;
        const oscillation = Math.sin(state.rotationTime * settings.rotateSpeed * 0.02) *
          (settings.rotateRange * Math.PI / 180);

        // Apply to selected axes
        particles.rotation.x = (settings.rotateAxis.includes('x')) ? oscillation : 0;
        particles.rotation.y = (settings.rotateAxis.includes('y')) ? oscillation : 0;
        particles.rotation.z = (settings.rotateAxis.includes('z')) ? oscillation : 0;
      } else {
        // Continuous or Morph-only mode
        const deltaRotation = speedFactor;

        // Reset non-selected axes
        if (!settings.rotateAxis.includes('x')) particles.rotation.x = 0;
        if (!settings.rotateAxis.includes('y')) particles.rotation.y = 0;
        if (!settings.rotateAxis.includes('z')) particles.rotation.z = 0;

        // Apply to selected axes
        if (settings.rotateAxis.includes('x')) particles.rotation.x += deltaRotation;
        if (settings.rotateAxis.includes('y')) particles.rotation.y += deltaRotation;
        if (settings.rotateAxis.includes('z')) particles.rotation.z += deltaRotation;
      }
      state.needsRender = true;
    }
  }

  // Only render if something changed
  if (state.needsRender) {
    state.renderer.render(state.scene, state.camera);
    state.needsRender = false;
  }
}

/**
 * Update status text
 * @param {string} msg - Status message
 */
function updateStatus(msg) {
  const statusText = document.getElementById('status-text');
  if (!statusText) return;

  statusText.innerText = msg;
  // Clear any status classes (loading, error) when updating status
  if (!msg.includes('Error') && !msg.includes('Processing')) {
    statusText.className = '';
  }
}

/**
 * Update button UI state
 */
function updateButtonUI() {
  const btn = document.getElementById('morphBtn');
  const { settings } = state;

  if (!btn) return;

  if (state.isPlaying) {
    btn.innerText = 'STOP';
    btn.className = 'action-btn stop-state';
  } else {
    if (settings.loopMode) {
      btn.innerText = 'START LOOP';
    } else {
      btn.innerText = 'MORPH ONCE';
    }
    btn.className = 'action-btn start-state';
  }
}

/**
 * Stop animation loop
 */
export function stopAnimation() {
  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }
}

/**
 * Start/stop playback
 */
export function togglePlayback() {
  const { images } = state;

  if (images.length < 2) {
    updateStatus('Error: Need 2+ images!');
    return;
  }

  if (state.isPlaying) {
    state.isPlaying = false;
    state.pauseCounter = 0;
    updateStatus('Stopped');
  } else {
    state.isPlaying = true;
    state.pauseCounter = 0;

    if (state.progress >= 1.0) {
      swapBuffers();
      state.particles.material.uniforms.uProgress.value = state.progress;
    }
    updateStatus('Playing...');
  }
  updateButtonUI();
}
