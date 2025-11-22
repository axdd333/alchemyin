const canvas = document.getElementById('mesh');
const ctx = canvas.getContext('2d');

let cols = 0;
let rows = 0;
let spacing = 120;
let points = [];

function createGrid() {
  spacing = Math.max(Math.min(canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio) / 12, 80);
  const width = canvas.width / window.devicePixelRatio;
  const height = canvas.height / window.devicePixelRatio;

  cols = Math.ceil(width / spacing) + 3;
  rows = Math.ceil(height / spacing) + 3;
  points = new Array(cols * rows);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      points[index] = {
        baseX: c * spacing - spacing,
        baseY: r * spacing - spacing,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.35,
        amp: 6 + Math.random() * 10,
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
  ctx.strokeStyle = 'rgba(22, 18, 15, 0.06)';

  const now = time * 0.001;
  const tension = 0.4;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const p = points[index];
      const x = p.baseX + Math.sin(now * p.speed + p.phase) * p.amp;
      const y = p.baseY + Math.cos(now * p.speed + p.phase) * p.amp;

      if (c < cols - 1) {
        const right = points[index + 1];
        const rx = right.baseX + Math.sin(now * right.speed + right.phase) * right.amp * tension;
        const ry = right.baseY + Math.cos(now * right.speed + right.phase) * right.amp * tension;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(rx, ry);
        ctx.stroke();
      }

      if (r < rows - 1) {
        const below = points[index + cols];
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
    }, 300 + index * 160);
  });
}

window.addEventListener('resize', resize);
window.addEventListener('DOMContentLoaded', () => {
  resize();
  requestAnimationFrame(draw);
  animateReveals();
});
