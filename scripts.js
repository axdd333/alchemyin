const canvas = document.getElementById('mesh');
const ctx = canvas.getContext('2d');

let gridCols = 0;
let gridRows = 0;
let spacing = 120;
let points = [];

function createGrid() {
  spacing = Math.max(Math.min(canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio) / 14, 90);
  const width = canvas.width / window.devicePixelRatio;
  const height = canvas.height / window.devicePixelRatio;

  gridCols = Math.ceil(width / spacing) + 3;
  gridRows = Math.ceil(height / spacing) + 3;
  points = new Array(gridCols * gridRows);

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const index = row * gridCols + col;
      points[index] = {
        baseX: col * spacing - spacing,
        baseY: row * spacing - spacing,
        phase: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 0.55,
        amp: 8 + Math.random() * 12,
      };
    }
  }
}

function resize() {
  const { innerWidth, innerHeight, devicePixelRatio } = window;
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  createGrid();
}

function draw(time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(31, 26, 23, 0.08)';

  const now = time * 0.001;
  const tension = 0.45;

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const index = row * gridCols + col;
      const p = points[index];
      const x = p.baseX + Math.sin(now * p.speed + p.phase) * p.amp;
      const y = p.baseY + Math.cos(now * p.speed + p.phase) * p.amp;

      // horizontal line
      if (col < gridCols - 1) {
        const right = points[index + 1];
        const rx = right.baseX + Math.sin(now * right.speed + right.phase) * right.amp * tension;
        const ry = right.baseY + Math.cos(now * right.speed + right.phase) * right.amp * tension;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(rx, ry);
        ctx.stroke();
      }

      // vertical line
      if (row < gridRows - 1) {
        const below = points[index + gridCols];
        const bx = below.baseX + Math.sin(now * below.speed + below.phase) * below.amp * tension;
        const by = below.baseY + Math.cos(now * below.speed + below.phase) * below.amp * tension;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
  requestAnimationFrame(draw);
}

function animateReveals() {
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('is-visible');
    }, 320 + index * 180);
  });
}

window.addEventListener('resize', resize);
window.addEventListener('DOMContentLoaded', () => {
  resize();
  requestAnimationFrame(draw);
  animateReveals();
});
