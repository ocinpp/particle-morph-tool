/**
 * Particle system creation and management
 */
import * as THREE from 'three';
import { PARTICLE_COUNT } from './constants.js';
import { state } from '../state/store.js';
import { createUniforms } from '../shaders/uniforms.js';

// Import shaders using vite-plugin-glsl
import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';

/**
 * Create the particle system with BufferGeometry and ShaderMaterial
 * @returns {THREE.Points} The particle system
 */
export function createParticleSystem() {
  const geometry = new THREE.BufferGeometry();

  // Create buffers for particle attributes
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const startPositions = new Float32Array(PARTICLE_COUNT * 3);
  const endPositions = new Float32Array(PARTICLE_COUNT * 3);
  const startColors = new Float32Array(PARTICLE_COUNT * 3);
  const endColors = new Float32Array(PARTICLE_COUNT * 3);
  const randomOffsets = new Float32Array(PARTICLE_COUNT);

  // Initialize with random positions
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 1000;
    positions[i3 + 1] = (Math.random() - 0.5) * 1000;
    positions[i3 + 2] = (Math.random() - 0.5) * 1000;
    randomOffsets[i] = Math.random();
  }

  // Set geometry attributes
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aStartPosition', new THREE.BufferAttribute(startPositions, 3));
  geometry.setAttribute('aEndPosition', new THREE.BufferAttribute(endPositions, 3));
  geometry.setAttribute('aColorStart', new THREE.BufferAttribute(startColors, 3));
  geometry.setAttribute('aColorEnd', new THREE.BufferAttribute(endColors, 3));
  geometry.setAttribute('aRandomOffset', new THREE.BufferAttribute(randomOffsets, 1));

  // Create shader material
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: createUniforms(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Create Points object
  const particles = new THREE.Points(geometry, material);
  state.particles = particles;
  state.scene.add(particles);

  // Create empty buffer for clearing
  state.emptyBuffer = new Float32Array(PARTICLE_COUNT * 3);

  return particles;
}

/**
 * Display a specific image in the particle system
 * @param {number} index - Index of the image to display
 */
export function displayImage(index) {
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

/**
 * Swap buffers for morphing between images
 */
export function swapBuffers() {
  const { particles, images } = state;
  if (images.length < 2 || !particles) return;

  const fromIndex = state.currentIndex;
  const toIndex = (state.currentIndex + 1) % images.length;

  const from = images[fromIndex];
  const to = images[toIndex];

  particles.geometry.attributes.aStartPosition.array.set(from.pos);
  particles.geometry.attributes.aColorStart.array.set(from.col);
  particles.geometry.attributes.aEndPosition.array.set(to.pos);
  particles.geometry.attributes.aColorEnd.array.set(to.col);

  particles.geometry.attributes.aStartPosition.needsUpdate = true;
  particles.geometry.attributes.aEndPosition.needsUpdate = true;
  particles.geometry.attributes.aColorStart.needsUpdate = true;
  particles.geometry.attributes.aColorEnd.needsUpdate = true;

  state.currentIndex = toIndex;
  state.progress = 0;
}

/**
 * Clear particle positions
 */
export function clearParticles() {
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
 * Update particle blending mode
 * @param {boolean} additive - Whether to use additive blending
 */
export function setBlendMode(additive) {
  if (state.particles) {
    state.particles.material.blending = additive
      ? THREE.AdditiveBlending
      : THREE.NormalBlending;
    state.needsRender = true;
  }
}
