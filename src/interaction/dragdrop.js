/**
 * Drag and drop handling for images
 */
import { state } from '../state/store.js';
import { addImage } from '../image/manager.js';

/**
 * Set up drag and drop handlers
 */
export function setupDragAndDrop() {
  const overlay = document.getElementById('dropOverlay');
  const container = document.getElementById('canvas-container');

  if (!container) return;

  // Create handlers
  const preventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const dragEnterHandler = () => {
    if (overlay) overlay.classList.add('visible');
  };

  const dragLeaveHandler = (e) => {
    if (!container.contains(e.relatedTarget)) {
      if (overlay) overlay.classList.remove('visible');
    }
  };

  const dropHandler = (e) => {
    e.preventDefault();
    if (overlay) overlay.classList.remove('visible');

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    files.forEach(file => addImage(file));
  };

  // Add prevention handlers for drag events
  const dragEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];
  dragEvents.forEach((event) => {
    container.addEventListener(event, preventHandler);
  });

  // Add custom handlers
  container.addEventListener('dragenter', dragEnterHandler);
  container.addEventListener('dragleave', dragLeaveHandler);
  container.addEventListener('drop', dropHandler);

  // Store handlers for cleanup
  state.boundHandlers.dragHandlers = [
    preventHandler, preventHandler, preventHandler, preventHandler,
    dragEnterHandler, dragLeaveHandler, dropHandler
  ];
}

/**
 * Remove drag and drop handlers
 */
export function removeDragAndDrop() {
  const container = document.getElementById('canvas-container');
  const { boundHandlers } = state;

  if (container && boundHandlers.dragHandlers.length > 0) {
    const dragEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];

    // First 4 are prevention handlers
    dragEvents.forEach((event, i) => {
      if (boundHandlers.dragHandlers[i]) {
        container.removeEventListener(event, boundHandlers.dragHandlers[i]);
      }
    });

    // Remaining handlers: dragEnter(4), dragLeave(5), drop(6)
    if (boundHandlers.dragHandlers[4]) {
      container.removeEventListener('dragenter', boundHandlers.dragHandlers[4]);
    }
    if (boundHandlers.dragHandlers[5]) {
      container.removeEventListener('dragleave', boundHandlers.dragHandlers[5]);
    }
    if (boundHandlers.dragHandlers[6]) {
      container.removeEventListener('drop', boundHandlers.dragHandlers[6]);
    }

    boundHandlers.dragHandlers = [];
  }
}
