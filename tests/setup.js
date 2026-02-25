// Test setup file for Vitest
// Mocks for WebGL, IndexedDB, and other browser APIs
/* eslint-disable no-undef */

// Mock WebGL context
class MockWebGLRenderingContext {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.drawingBufferWidth = 800;
    this.drawingBufferHeight = 600;
  }

  getParameter() {
    return 'WebGL 2.0';
  }

  getExtension() {
    return null;
  }

  createShader() {
    return {};
  }

  shaderSource() {}

  compileShader() {}

  getShaderParameter() {
    return true;
  }

  createProgram() {
    return {};
  }

  attachShader() {}

  linkProgram() {}

  getProgramParameter() {
    return true;
  }

  useProgram() {}

  getAttribLocation() {
    return 0;
  }

  getUniformLocation() {
    return {};
  }

  createBuffer() {
    return {};
  }

  bindBuffer() {}

  bufferData() {}

  enableVertexAttribArray() {}

  vertexAttribPointer() {}

  uniform1f() {}

  uniform2f() {}

  uniform3f() {}

  uniform4f() {}

  uniformMatrix4fv() {}

  drawArrays() {}

  clearColor() {}

  clear() {}

  enable() {}

  disable() {}

  blendFunc() {}

  viewport() {}

  deleteShader() {}

  deleteProgram() {}

  deleteBuffer() {}
}

// Mock IndexedDB
const mockIndexedDB = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  open: vi.fn((_name, _version) => {
    const request = {
      result: null,
      error: null,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
    };

    setTimeout(() => {
      const db = {
        createObjectStore: vi.fn(),
        objectStoreNames: { contains: vi.fn(() => false) },
        transaction: vi.fn(() => ({
          objectStore: vi.fn(() => ({
            put: vi.fn(() => ({ onsuccess: null, onerror: null })),
            get: vi.fn(() => ({ onsuccess: null, onerror: null })),
            delete: vi.fn(() => ({ onsuccess: null, onerror: null })),
            clear: vi.fn(() => ({ onsuccess: null, onerror: null })),
          })),
        })),
        close: vi.fn(),
      };
      request.result = db;
      if (request.onupgradeneeded) {
        request.onupgradeneeded({ target: request });
      }
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    }, 0);

    return request;
  }),
  deleteDatabase: vi.fn(),
};

// Mock canvas getContext
// @ts-expect-error Mocking for tests
HTMLCanvasElement.prototype.getContext = vi.fn((type) => {
  if (type === '2d') {
    return {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(800 * 600 * 4),
        width: 800,
        height: 600,
      })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(800 * 600 * 4),
        width: 800,
        height: 600,
      })),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      arc: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
    };
  }
  if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
    return new MockWebGLRenderingContext();
  }
  return null;
});

// Mock Image
class MockImage {
  constructor() {
    this._src = '';
    this.onload = null;
    this.onerror = null;
    this.width = 100;
    this.height = 100;
    this.naturalWidth = 100;
    this.naturalHeight = 100;
    this.complete = false;
  }

  set src(value) {
    this._src = value;
    if (value) {
      setTimeout(() => {
        this.complete = true;
        if (this.onload) this.onload();
      }, 0);
    }
  }

  get src() {
    return this._src;
  }

  decode() {
    return Promise.resolve();
  }
}
globalThis.Image = MockImage;

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16);
});

globalThis.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

// Mock performance.now
globalThis.performance.now = vi.fn(() => Date.now());

// Mock URL.createObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
globalThis.URL.revokeObjectURL = vi.fn();

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value;
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

// Mock IndexedDB on global
Object.defineProperty(globalThis, 'indexedDB', {
  value: mockIndexedDB,
});

// Mock devicePixelRatio
Object.defineProperty(globalThis, 'devicePixelRatio', {
  value: 1,
  writable: true,
});

// Mock File
class MockFile {
  constructor(bits, name, options = {}) {
    this._bits = bits;
    this._name = name;
    this.type = options.type || '';
    this.size = bits.reduce((acc, b) => acc + (b.length || 0), 0);
  }

  get name() {
    return this._name;
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }

  text() {
    return Promise.resolve('');
  }

  slice() {
    return new Blob();
  }
}
globalThis.File = MockFile;

// Mock Blob
class MockBlob {
  constructor(bits, options = {}) {
    this._bits = bits;
    this.type = options.type || '';
    this.size = bits.reduce((acc, b) => acc + (b.length || 0), 0);
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }

  text() {
    return Promise.resolve('');
  }

  slice() {
    return new MockBlob(this._bits, { type: this.type });
  }
}
globalThis.Blob = MockBlob;

// Mock fetch
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    blob: () => Promise.resolve(new MockBlob()),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});
