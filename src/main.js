// Placeholder main.js - will be populated in Phase 2
import './style.css';

console.log('Particle Morph Tool - Dev server working!');

// Placeholder for now - the full application will be extracted in subsequent phases
function init() {
  const container = document.getElementById('canvas-container');
  const statusText = document.getElementById('status-text');

  if (container) {
    container.innerHTML = '<p style="color: #0af; padding: 20px;">Loading application...</p>';
  }

  if (statusText) {
    statusText.textContent = 'Infrastructure setup complete - ready for module extraction';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
