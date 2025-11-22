// scripts.js
/**
 * ALCHEMYIN: THE COSMIC COLUMN RESTORED
 * Nihilistic Luxury + Ancient Motif
 */

const CONFIG = {
  color: {
    bg: 0xeae8e3,
    lines: 0x111111,
    particles: 0x000000,
    light: 0xffffff
  },
  camera: {
    fov: 35,
    z: 18,
    introZ: 12 // The closer position after the dolly-in
  },
  temple: {
    columnHeight: 4,
    baseWidth: 7,
    pedimentHeight: 1.5
  }
};

class VoidTemple {
  constructor() {
    this.canvas = document.querySelector("#temple-canvas");
    if (!this.canvas || !window.THREE) return;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.mouseX = 0;
    this.mouseY = 0;

    this.init();
    this.createTempleArtifact();
    this.addAtmosphere();
    this.events();
    this.animateIntro();
    this.render();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.color.bg);
    this.scene.fog = new THREE.FogExp2(CONFIG.color.bg, 0.04);

    this.camera = new THREE.PerspectiveCamera(
      CONFIG.camera.fov,
      this.width / this.height,
      0.1,
      100
    );
    this.camera.position.set(0, 0, CONFIG.camera.z);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Subtle lighting
    const light = new THREE.DirectionalLight(CONFIG.color.light, 0.6);
    light.position.set(10, 15, 10);
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  }

  createTempleArtifact() {
    this.artifact = new THREE.Group();

    // Wireframe materials
    const lineMat = new THREE.LineBasicMaterial({
      color: CONFIG.color.lines,
      transparent: true,
      opacity: 0.18,
      linewidth: 1
    });

    const heavyMat = new THREE.LineBasicMaterial({
      color: CONFIG.color.lines,
      transparent: true,
      opacity: 0.4,
      linewidth: 1
    });

    // PILLARS
    const pillarGeo = new THREE.BoxGeometry(
      0.2,
      CONFIG.temple.columnHeight,
      0.2
    );
    const columnCount = 4;
    const spacing = 2;
    const offset = ((columnCount - 1) * spacing) / 2;

    for (let i = 0; i < columnCount; i++) {
      const pillar = new THREE.LineSegments(
        new THREE.EdgesGeometry(pillarGeo),
        lineMat
      );
      pillar.position.set(i * spacing - offset, 0, 0);
      this.artifact.add(pillar);
    }

    // BASE
    const baseGeo = new THREE.BoxGeometry(CONFIG.temple.baseWidth, 0.2, 2);
    const base = new THREE.LineSegments(
      new THREE.EdgesGeometry(baseGeo),
      lineMat
    );
    base.position.y = -CONFIG.temple.columnHeight / 2 - 0.1;
    this.artifact.add(base);

    // COSMIC ARC
    const arcRadius = 3.5;
    const arcGeo = new THREE.TorusGeometry(
      arcRadius,
      0.01,
      3,
      100,
      Math.PI * 1.5
    );
    this.arc = new THREE.LineSegments(new THREE.EdgesGeometry(arcGeo), heavyMat);
    this.arc.rotation.z = Math.PI / 2;
    this.arc.position.y = 1.5;
    this.artifact.add(this.arc);

    // CORE (floating icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(0.8, 0);
    this.core = new THREE.LineSegments(
      new THREE.EdgesGeometry(coreGeo),
      lineMat
    );
    this.core.position.set(0, 1.5, 0);
    this.artifact.add(this.core);

    this.scene.add(this.artifact);
  }

  addAtmosphere() {
    const count = 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 20;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: CONFIG.color.particles,
      size: 0.03,
      transparent: true,
      opacity: 0.12
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  animateIntro() {
    const loader = document.getElementById("loader");
    if (!loader) return;

    loader.classList.remove("loaded");

    const duration = 3000;
    const startZ = CONFIG.camera.z;
    const endZ = CONFIG.camera.introZ;
    let startTime = null;

    const loop = (time) => {
      if (!startTime) startTime = time;
      const elapsed = (time - startTime) / 1000;
      const t = Math.min(elapsed / (duration / 1000), 1);

      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      this.camera.position.z = startZ + (endZ - startZ) * ease;

      if (t < 1) {
        requestAnimationFrame(loop);
      } else {
        loader.classList.add("loaded");
      }
    };

    requestAnimationFrame(loop);
  }

  events() {
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });

    document.addEventListener("mousemove", (e) => {
      this.mouseX = (e.clientX / this.width) * 2 - 1;
      this.mouseY = -(e.clientY / this.height) * 2 + 1;
    });
  }

  render() {
    const time = Date.now() * 0.0005;

    // Artifact rotation & float
    if (this.artifact) {
      this.artifact.rotation.y += 0.001;
      this.artifact.position.y = Math.sin(time * 0.8) * 0.05;
    }

    // Core spin
    if (this.core) {
      this.core.rotation.x = time * 0.5;
      this.core.rotation.z = time * 0.3;
    }

    // Parallax camera
    this.camera.position.x +=
      (this.mouseX * 1.0 - this.camera.position.x) * 0.05;
    this.camera.position.y = this.mouseY * 0.5;
    this.camera.lookAt(0, 0, 0);

    // Particle drift
    if (this.particles) {
      this.particles.rotation.y = time * 0.01;
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

/* Subtle 2D wirefield behind the hero */

(function () {
  const canvas = document.getElementById("wisdom-field");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let width, height, t;
  const density = 26;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw(time) {
    if (!t) t = time;
    t = time;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = "rgba(0,0,0,0.10)";

    const cx = width / 2;
    const cy = height / 2;

    for (let x = -density * 2; x < width + density * 2; x += density) {
      ctx.beginPath();
      for (let y = -density * 2; y < height + density * 2; y += density) {
        const dx = (x - cx) / width;
        const dy = (y - cy) / height;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const wave =
          Math.sin(dist * 9 - time * 0.0009) * 10 * Math.exp(-dist * 2.4);

        const px = x;
        const py = y + wave;

        if (y === -density * 2) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
})();

/* Boot the temple once DOM is ready */

window.addEventListener("DOMContentLoaded", () => {
  new VoidTemple();
});
