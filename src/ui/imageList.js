/**
 * Image list UI management
 */
import { state } from '../state/store.js';
import { displayImage } from '../core/particles.js';

/**
 * Update the image list UI
 */
export function updateImageList() {
  const list = document.getElementById('imageList');
  const counter = document.getElementById('imageCounter');

  if (!list) return;

  // Generate image items HTML
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
  setupImageItemHandlers(list);
}

/**
 * Set up handlers for image items
 * @param {HTMLElement} list - The image list element
 */
function setupImageItemHandlers(list) {
  list.querySelectorAll('.image-item').forEach(item => {
    // Click handler - select image
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

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drag-over');
      handleImageReorder(e, item);
    });
  });

  // Remove button handlers
  list.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      removeImage(index);
    });
  });
}

/**
 * Handle image reordering via drag and drop
 */
async function handleImageReorder(e, targetItem) {
  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
  const toIndex = parseInt(targetItem.dataset.index);

  if (fromIndex === toIndex) return;

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
      const { clearImageDB, saveImageToDB } = await import('../image/storage.js');
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

/**
 * Remove an image from the list
 * @param {number} index - Index of image to remove
 */
async function removeImage(index) {
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
      const { deleteImageFromDB } = await import('../image/storage.js');
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
  updateStatus(state.images.length < 2 ? `Add ${2 - state.images.length} more image(s)` : 'Ready - Press Space');
}

/**
 * Clear all particles
 */
function clearParticles() {
  const { particles, emptyBuffer } = state;
  if (!particles || !emptyBuffer) return;

  particles.geometry.attributes.aStartPosition.array.set(emptyBuffer);
  particles.geometry.attributes.aEndPosition.array.set(emptyBuffer);
  particles.geometry.attributes.aColorStart.array.set(emptyBuffer);
  particles.geometry.attributes.aColorEnd.array.set(emptyBuffer);

  particles.geometry.attributes.aStartPosition.needsUpdate = true;
  particles.geometry.attributes.aEndPosition.needsUpdate = true;
  particles.geometry.attributes.aColorStart.needsUpdate = true;
  particles.geometry.attributes.aColorEnd.needsUpdate = true;

  state.progress = 0;
}

/**
 * Update status text
 */
function updateStatus(msg) {
  const statusText = document.getElementById('status-text');
  if (!statusText) return;
  statusText.innerText = msg;
  if (!msg.includes('Error') && !msg.includes('Processing')) {
    statusText.className = '';
  }
}
