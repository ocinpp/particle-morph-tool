/**
 * Image management - add, remove, reorder images
 */
import { state } from '../state/store.js';
import { getImageBuffers } from './processor.js';
import { saveImageToDB, deleteImageFromDB, clearImageDB } from './storage.js';
import { displayImage, clearParticles } from '../core/particles.js';
import { MAX_IMAGE_DIMENSION } from '../core/constants.js';

/**
 * Update status text
 * @param {string} msg - Status message
 */
function updateStatus(msg) {
  const statusText = document.getElementById('status-text');
  if (!statusText) return;
  statusText.innerText = msg;
  if (!msg.includes('Error') && !msg.includes('Processing')) {
    statusText.className = '';
  }
}

/**
 * Add an image from a file
 * @param {File} file - Image file to add
 * @returns {Promise<void>}
 */
export async function addImage(file) {
  return addImageFromFile(file, true, null);
}

/**
 * Add an image from a file with options
 * @param {File} file - Image file to add
 * @param {boolean} saveToDB - Whether to save to IndexedDB
 * @param {number|null} existingId - Existing ID if reloading from DB
 * @returns {Promise<void>}
 */
export async function addImageFromFile(file, saveToDB = true, existingId = null) {
  if (!file || !file.type.startsWith('image/')) return;

  state.isPlaying = false;
  state.pauseCounter = 0;
  updateButtonUI();

  // Show loading state
  const statusText = document.getElementById('status-text');
  statusText.innerHTML = '<span class="spinner"></span>Processing...';
  statusText.className = 'status-loading';

  const objectUrl = URL.createObjectURL(file);
  const imageId = existingId !== null ? existingId : state.imageIdCounter++;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      try {
        let w = img.width;
        let h = img.height;
        if (w > MAX_IMAGE_DIMENSION || h > MAX_IMAGE_DIMENSION) {
          const ratio = Math.min(MAX_IMAGE_DIMENSION / w, MAX_IMAGE_DIMENSION / h);
          w = Math.floor(w * ratio);
          h = Math.floor(h * ratio);
        }

        // Ensure process canvas exists
        if (!state.processCanvas) {
          state.processCanvas = document.createElement('canvas');
          state.processCtx = state.processCanvas.getContext('2d');
        }

        state.processCanvas.width = w;
        state.processCanvas.height = h;
        state.processCtx.clearRect(0, 0, w, h);
        state.processCtx.drawImage(img, 0, 0, w, h);
        const data = state.processCtx.getImageData(0, 0, w, h);
        const imgDataObj = { data: data.data, width: w, height: h };

        const buffers = getImageBuffers(imgDataObj);

        const imageData = {
          pos: buffers.positions,
          col: buffers.colors,
          url: objectUrl,
          name: file.name,
          id: imageId,
        };

        // Add to images array
        state.images.push(imageData);

        // Save to IndexedDB if requested
        if (saveToDB && state.imageDB) {
          try {
            await saveImageToDB(file, imageId, file.name);
          } catch (err) {
            console.warn('Failed to save image to DB:', err);
          }
        }

        // Update UI
        updateImageList();

        // If first image, display it
        if (state.images.length === 1) {
          displayImage(0);
        }

        updateStatus(state.images.length < 2 ? `Add ${2 - state.images.length} more image(s)` : 'Ready - Press Space');
        statusText.className = '';
        resolve();
      } catch (err) {
        console.error('Image processing error:', err);
        updateStatus('Error: ' + err.message);
        statusText.className = 'status-error';
        URL.revokeObjectURL(objectUrl);
        resolve();
      }

      img.onload = null;
      img.onerror = null;
    };

    img.onerror = () => {
      updateStatus('Error: Failed to load image');
      statusText.className = 'status-error';
      URL.revokeObjectURL(objectUrl);
      img.onload = null;
      img.onerror = null;
      resolve();
    };

    img.src = objectUrl;
  });
}

/**
 * Remove an image by index
 * @param {number} index - Index of image to remove
 * @returns {Promise<void>}
 */
export async function removeImage(index) {
  if (index < 0 || index >= state.images.length) return;

  const imageId = state.images[index].id;

  // Revoke URL
  URL.revokeObjectURL(state.images[index].url);

  // Remove from array
  state.images.splice(index, 1);

  // Adjust currentIndex if needed
  if (state.currentIndex >= state.images.length) {
    state.currentIndex = Math.max(0, state.images.length - 1);
  }

  // Delete from IndexedDB
  if (state.imageDB && imageId !== undefined) {
    try {
      await deleteImageFromDB(imageId);
    } catch (err) {
      console.warn('Failed to delete image from DB:', err);
    }
  }

  // Update UI
  updateImageList();

  // Display current or clear
  if (state.images.length > 0) {
    displayImage(state.currentIndex);
  } else {
    clearParticles();
  }

  state.isPlaying = false;
  updateButtonUI();
  updateStatus(state.images.length < 2 ? `Add ${2 - state.images.length} more image(s)` : 'Ready - Press Space');
}

/**
 * Update the image list UI
 */
export function updateImageList() {
  const list = document.getElementById('imageList');
  const counter = document.getElementById('imageCounter');

  if (!list) return;

  list.innerHTML = state.images.map((img, i) => `
    <div class="image-item ${i === state.currentIndex ? 'active' : ''}" data-index="${i}" draggable="true">
      <span class="number">${i + 1}</span>
      <img class="preview" src="${img.url}" alt="Preview ${i + 1}" />
      <span class="name">${img.name}</span>
      <button class="remove-btn" data-index="${i}">×</button>
    </div>
  `).join('');

  // Update counter
  if (counter) {
    if (state.images.length === 0) {
      counter.innerHTML = 'Add 2+ images to start';
    } else {
      counter.innerHTML = `<span class="current">${state.currentIndex + 1}</span> of ${state.images.length}`;
    }
  }

  // Add click and drag handlers
  list.querySelectorAll('.image-item').forEach(item => {
    // Click handler
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-btn')) return;
      const index = parseInt(item.dataset.index);
      if (!state.isPlaying && index !== state.currentIndex) {
        state.currentIndex = index;
        displayImage(index);
        updateImageList();
      }
    });

    // Drag handlers for reordering
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.dataset.index);
      item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      list.querySelectorAll('.image-item').forEach(i => i.classList.remove('drag-over'));
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      item.classList.add('drag-over');
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
    });

    item.addEventListener('drop', async (e) => {
      e.preventDefault();
      item.classList.remove('drag-over');

      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      const toIndex = parseInt(item.dataset.index);

      if (fromIndex !== toIndex) {
        // Reorder images array
        const [moved] = state.images.splice(fromIndex, 1);
        state.images.splice(toIndex, 0, moved);

        // Update currentIndex if needed
        if (state.currentIndex === fromIndex) {
          state.currentIndex = toIndex;
        } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
          state.currentIndex--;
        } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
          state.currentIndex++;
        }

        // Rebuild IndexedDB with new order
        if (state.imageDB) {
          try {
            await clearImageDB();
            for (let i = 0; i < state.images.length; i++) {
              const response = await fetch(state.images[i].url);
              const blob = await response.blob();
              await saveImageToDB(blob, state.images[i].id, state.images[i].name);
            }
          } catch (err) {
            console.warn('Failed to update image DB after reorder:', err);
          }
        }

        updateImageList();
        state.needsRender = true;
      }
    });
  });

  list.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeImage(parseInt(btn.dataset.index));
    });
  });
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
 * Set up image file input handlers
 */
export function setupImageHandlers() {
  const fileInput = document.getElementById('imageFileInput');
  const addBtn = document.getElementById('addImageBtn');

  if (addBtn && fileInput) {
    addBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => addImage(file));
      fileInput.value = ''; // Reset for re-adding same file
    });
  }
}
