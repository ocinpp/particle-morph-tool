/**
 * Image processing utilities for particle system
 */
import * as THREE from 'three';
import { PARTICLE_COUNT, MAX_IMAGE_DIMENSION } from '../core/constants.js';
import { state, initializeProcessCanvas } from '../state/store.js';

/**
 * Process image data into particle positions and colors
 * @param {ImageData} imgData - Image data from canvas
 * @returns {Object} Position and color buffers
 */
export function getImageBuffers(imgData) {
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  const col = new Float32Array(PARTICLE_COUNT * 3);

  const width = imgData.width;
  const height = imgData.height;
  const pixels = imgData.data;

  // Find content bounds
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (pixels[i + 3] > 128) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  // Calculate scale to fit in camera view
  const { camera } = state;
  const { settings } = state;

  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const vHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
  const vWidth = vHeight * camera.aspect;

  const scaleX = vWidth / contentWidth;
  const scaleY = vHeight / contentHeight;
  const scale = Math.min(scaleX, scaleY) * settings.imageScale;

  const centerX = minX + contentWidth / 2;
  const centerY = minY + contentHeight / 2;

  let particleIndex = 0;

  // Map pixels to particles
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      if (pixels[i + 3] < 128) continue;

      if (particleIndex < PARTICLE_COUNT) {
        const i3 = particleIndex * 3;

        pos[i3] = (x - centerX) * scale;
        pos[i3 + 1] = -(y - centerY) * scale;
        pos[i3 + 2] = (Math.random() - 0.5) * settings.zDepth;

        col[i3] = pixels[i] / 255;
        col[i3 + 1] = pixels[i + 1] / 255;
        col[i3 + 2] = pixels[i + 2] / 255;

        particleIndex++;
      }
    }
  }

  // Fill remaining particles with hidden values
  while (particleIndex < PARTICLE_COUNT) {
    const i3 = particleIndex * 3;
    pos[i3] = 0;
    pos[i3 + 1] = 0;
    pos[i3 + 2] = -10000;
    col[i3] = 0;
    col[i3 + 1] = 0;
    col[i3 + 2] = 0;
    particleIndex++;
  }

  return { positions: pos, colors: col };
}

/**
 * Process an image file into particle data
 * @param {File} file - Image file to process
 * @returns {Promise<Object>} Image data with position and color buffers
 */
export async function processImageFile(file) {
  return new Promise((resolve, reject) => {
    initializeProcessCanvas();
    const { processCanvas, processCtx } = state;

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        let w = img.width;
        let h = img.height;

        // Scale down if too large
        if (w > MAX_IMAGE_DIMENSION || h > MAX_IMAGE_DIMENSION) {
          const ratio = Math.min(MAX_IMAGE_DIMENSION / w, MAX_IMAGE_DIMENSION / h);
          w = Math.floor(w * ratio);
          h = Math.floor(h * ratio);
        }

        processCanvas.width = w;
        processCanvas.height = h;
        processCtx.clearRect(0, 0, w, h);
        processCtx.drawImage(img, 0, 0, w, h);
        const data = processCtx.getImageData(0, 0, w, h);

        const buffers = getImageBuffers(data);

        // Clean up
        URL.revokeObjectURL(objectUrl);

        resolve({
          pos: buffers.positions,
          col: buffers.colors,
          url: objectUrl,
          name: file.name,
        });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

/**
 * Reprocess all images (e.g., after scale change)
 */
export async function reprocessImages() {
  const { images, processCanvas, processCtx } = state;
  if (images.length === 0) return;

  // Abort any previous reprocessing
  if (state.reprocessAbortController) {
    state.reprocessAbortController.abort();
  }
  state.reprocessAbortController = new window.AbortController();
  const signal = state.reprocessAbortController.signal;

  initializeProcessCanvas();

  for (let index = 0; index < images.length; index++) {
    if (signal.aborted) return;

    const imgData = images[index];
    const img = new Image();

    await new Promise((resolve) => {
      img.onload = () => {
        if (signal.aborted || !images[index]) {
          resolve();
          return;
        }

        let w = img.width;
        let h = img.height;

        if (w > MAX_IMAGE_DIMENSION || h > MAX_IMAGE_DIMENSION) {
          const ratio = Math.min(MAX_IMAGE_DIMENSION / w, MAX_IMAGE_DIMENSION / h);
          w = Math.floor(w * ratio);
          h = Math.floor(h * ratio);
        }

        processCanvas.width = w;
        processCanvas.height = h;
        processCtx.clearRect(0, 0, w, h);
        processCtx.drawImage(img, 0, 0, w, h);
        const data = processCtx.getImageData(0, 0, w, h);
        const buffers = getImageBuffers(data);

        if (!signal.aborted && images[index]) {
          images[index].pos = buffers.positions;
          images[index].col = buffers.colors;

          // Update display if this is the current image and not playing
          if (index === state.currentIndex && !state.isPlaying) {
            displayImage(state.currentIndex);
          }
        }

        resolve();
      };

      img.onerror = () => {
        if (!signal.aborted) {
          console.warn('Failed to reprocess image:', imgData.name);
        }
        resolve();
      };

      img.src = imgData.url;
    });
  }
}

/**
 * Display a specific image in the particle system
 * @param {number} index - Index of the image to display
 */
function displayImage(index) {
  const { particles, images } = state;
  if (!images[index] || !particles) return;

  const img = images[index];
  particles.geometry.attributes.aStartPosition.array.set(img.pos);
  particles.geometry.attributes.aEndPosition.array.set(img.pos);
  particles.geometry.attributes.aColorStart.array.set(img.col);
  particles.geometry.attributes.aColorEnd.array.set(img.col);

  particles.geometry.attributes.aStartPosition.needsUpdate = true;
  particles.geometry.attributes.aEndPosition.needsUpdate = true;
  particles.geometry.attributes.aColorStart.needsUpdate = true;
  particles.geometry.attributes.aColorEnd.needsUpdate = true;

  particles.material.uniforms.uProgress.value = 1.0;
  state.progress = 1.0;
  state.needsRender = true;
}
