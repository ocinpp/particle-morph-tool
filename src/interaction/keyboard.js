/**
 * Keyboard shortcut handling
 */
import { state } from '../state/store.js';
import { togglePlayback } from '../core/animation.js';

/**
 * Set up keyboard event handlers
 */
export function setupKeyboardHandlers() {
  // Handle fullscreen changes (including native ESC to exit fullscreen)
  const fullscreenHandler = () => {
    const ui = document.getElementById('ui');
    const restoreBtn = document.getElementById('restoreBtn');

    if (!document.fullscreenElement) {
      // Exited fullscreen - show UI
      if (ui) ui.classList.remove('hidden');
      if (restoreBtn) restoreBtn.style.display = 'none';
    }
  };
  document.addEventListener('fullscreenchange', fullscreenHandler);
  state.boundHandlers.fullscreenchange = fullscreenHandler;

  const handler = (e) => {
    // Allow ESC to work regardless of focus
    if (e.code === 'Escape') {
      e.preventDefault();
      toggleUI();
      return;
    }

    // Ignore if typing in a text input
    const isTextInput = e.target.tagName === 'INPUT' &&
      !['checkbox', 'radio', 'file', 'range'].includes(e.target.type);
    const isSelect = e.target.tagName === 'SELECT';
    const isTextarea = e.target.tagName === 'TEXTAREA';
    if (isTextInput || isSelect || isTextarea) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlayback();
        break;

      case 'KeyF':
        e.preventDefault();
        toggleFullscreen();
        break;

      case 'KeyS':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          takeScreenshot();
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        navigateImage(-1);
        break;

      case 'ArrowRight':
        e.preventDefault();
        navigateImage(1);
        break;

      case 'KeyR':
        if (e.ctrlKey || e.metaKey) {
          // Let browser handle reload
          return;
        }
        e.preventDefault();
        resetView();
        break;
    }
  };

  document.addEventListener('keydown', handler);
  state.boundHandlers.keydown = handler;
}

/**
 * Remove keyboard handlers
 */
export function removeKeyboardHandlers() {
  if (state.boundHandlers.keydown) {
    document.removeEventListener('keydown', state.boundHandlers.keydown);
    state.boundHandlers.keydown = null;
  }
  if (state.boundHandlers.fullscreenchange) {
    document.removeEventListener('fullscreenchange', state.boundHandlers.fullscreenchange);
    state.boundHandlers.fullscreenchange = null;
  }
}

/**
 * Toggle UI visibility
 */
function toggleUI() {
  const ui = document.getElementById('ui');
  const restoreBtn = document.getElementById('restoreBtn');

  if (ui) {
    ui.classList.toggle('hidden');
    if (restoreBtn) {
      restoreBtn.style.display = ui.classList.contains('hidden') ? 'block' : 'none';
    }
  }
}

/**
 * Toggle fullscreen mode (presentation mode - hides all UI)
 */
function toggleFullscreen() {
  const ui = document.getElementById('ui');
  const restoreBtn = document.getElementById('restoreBtn');

  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn('Fullscreen error:', err);
    });
    // Hide all UI for clean presentation mode
    if (ui) ui.classList.add('hidden');
    if (restoreBtn) restoreBtn.style.display = 'none';
  } else {
    document.exitFullscreen();
    // Show UI when exiting fullscreen
    if (ui) ui.classList.remove('hidden');
    if (restoreBtn) restoreBtn.style.display = 'none';
  }
}

/**
 * Take a screenshot
 */
function takeScreenshot() {
  if (!state.renderer) return;

  // Render a clean frame
  state.renderer.render(state.scene, state.camera);

  state.renderer.domElement.toBlob((blob) => {
    if (!blob) {
      updateStatus('Screenshot failed!');
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'particle-morph-' + Date.now() + '.png';
    link.href = url;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 100);
    updateStatus('Screenshot saved!');

    setTimeout(() => {
      updateStatus(state.isPlaying ? 'Playing...' : 'Ready');
    }, 2000);
  }, 'image/png');
}

/**
 * Navigate between images
 * @param {number} direction - -1 for previous, 1 for next
 */
function navigateImage(direction) {
  if (state.images.length === 0 || state.isPlaying) return;

  const newIndex = state.currentIndex + direction;
  if (newIndex < 0 || newIndex >= state.images.length) return;

  state.currentIndex = newIndex;

  // Import displayImage dynamically to avoid circular dependency
  import('../core/particles.js').then(({ displayImage }) => {
    displayImage(newIndex);
  });

  // Update image list UI
  import('../ui/imageList.js').then(({ updateImageList }) => {
    updateImageList();
  });
}

/**
 * Reset view to default
 */
function resetView() {
  if (!state.particles) return;

  // Reset rotation
  state.particles.rotation.set(0, 0, 0);
  state.particles.position.x = 0;
  state.particles.position.y = 0;
  state.rotationTime = 0;

  state.needsRender = true;
  updateStatus('View reset');
}

/**
 * Update status text
 */
function updateStatus(msg) {
  const statusText = document.getElementById('status-text');
  if (statusText) {
    statusText.innerText = msg;
    if (!msg.includes('Error') && !msg.includes('Processing')) {
      statusText.className = '';
    }
  }
}
