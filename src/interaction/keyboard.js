/**
 * Keyboard shortcut handling
 */
import { state } from '../state/store.js';
import { togglePlayback } from '../core/animation.js';

/**
 * Set up keyboard event handlers
 */
export function setupKeyboardHandlers() {
  const handler = (e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlayback();
        break;

      case 'Escape':
        e.preventDefault();
        toggleUI();
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
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn('Fullscreen error:', err);
    });
  } else {
    document.exitFullscreen();
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
