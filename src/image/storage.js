/**
 * IndexedDB storage for image persistence
 */
import { IMAGE_DB_NAME, IMAGE_DB_VERSION, IMAGE_STORE_NAME } from '../core/constants.js';
import { state } from '../state/store.js';

/**
 * Open the IndexedDB database for image storage
 * @returns {Promise<IDBDatabase>}
 */
export function openImageDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IMAGE_DB_NAME, IMAGE_DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      state.imageDB = request.result;
      resolve(state.imageDB);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        db.createObjectStore(IMAGE_STORE_NAME);
      }
    };
  });
}

/**
 * Save an image blob to IndexedDB
 * @param {Blob} blob - Image blob to save
 * @param {number} id - Unique identifier for the image
 * @param {string} name - File name
 * @returns {Promise<void>}
 */
export function saveImageToDB(blob, id, name) {
  if (!state.imageDB) return Promise.reject(new Error('DB not open'));
  return new Promise((resolve, reject) => {
    const tx = state.imageDB.transaction(IMAGE_STORE_NAME, 'readwrite');
    const store = tx.objectStore(IMAGE_STORE_NAME);
    const request = store.put({ blob, name: name || 'image.png' }, id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete an image from IndexedDB
 * @param {number} id - Image identifier to delete
 * @returns {Promise<void>}
 */
export function deleteImageFromDB(id) {
  if (!state.imageDB) return Promise.reject(new Error('DB not open'));
  return new Promise((resolve, reject) => {
    const tx = state.imageDB.transaction(IMAGE_STORE_NAME, 'readwrite');
    const store = tx.objectStore(IMAGE_STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all images from IndexedDB
 * @returns {Promise<void>}
 */
export function clearImageDB() {
  if (!state.imageDB) return Promise.reject(new Error('DB not open'));
  return new Promise((resolve, reject) => {
    const tx = state.imageDB.transaction(IMAGE_STORE_NAME, 'readwrite');
    const store = tx.objectStore(IMAGE_STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load all images from IndexedDB
 * @param {Function} addImageFromFile - Function to process and add image
 * @returns {Promise<void>}
 */
export async function loadImagesFromDB(addImageFromFile) {
  if (!state.imageDB) return;

  return new Promise((resolve, reject) => {
    const tx = state.imageDB.transaction(IMAGE_STORE_NAME, 'readonly');
    const store = tx.objectStore(IMAGE_STORE_NAME);
    const request = store.openCursor();
    const blobs = [];
    const ids = [];

    request.onsuccess = async (event) => {
      const cursor = event.target.result;
      if (cursor) {
        blobs.push(cursor.value);
        ids.push(parseInt(cursor.key));
        cursor.continue();
      } else {
        // Done collecting
        if (blobs.length === 0) {
          resolve();
          return;
        }

        // Show loading status
        const statusText = document.getElementById('status-text');
        statusText.innerHTML = '<span class="spinner"></span>Restoring images...';
        statusText.className = 'status-loading';

        // Process each blob
        try {
          for (let i = 0; i < blobs.length; i++) {
            const data = blobs[i];
            const id = ids[i];
            if (!data) continue;

            // Extract blob and name (support both old and new format)
            const blob = data.blob || data;
            const name = data.name || `image_${i}.png`;

            // Update ID counter to be higher than any existing ID
            if (id >= state.imageIdCounter) state.imageIdCounter = id + 1;

            // Convert blob to File-like object
            const file = new File([blob], name, { type: blob.type || 'image/png' });

            // Use addImage but skip DB save (already in DB)
            await addImageFromFile(file, false, id);
          }

          statusText.className = '';
          resolve();
        } catch (err) {
          statusText.className = 'status-error';
          reject(err);
        }
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Close the IndexedDB connection
 */
export function closeImageDB() {
  if (state.imageDB) {
    state.imageDB.close();
    state.imageDB = null;
  }
}
