/**
 * ALCHEMYIN · HOUSE OF WISDOM
 * Subtle 3D artifact + inner scroll navigation
 */

const CONFIG = {
  color: {
    bg: 0xeae8e3,
    object: 0x111111,
    light: 0xffffff
  },
  camera: {
    fov: 35,
    z: 13
  }
};

class VoidExperience {
  constructor() {
    this.canvas = document.querySelector("#artifact-canvas");
    if (!this.canvas || typeof THREE === "undefined") return;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouseX = 0;
    this.mouseY = 0;

    this.init();
    this.createArtifact();
    this.addAtmosphere();
    this.bindEvents();
    this.render();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.color.bg);
    this.scene.fog = new THREE.FogExp2(CONFIG.color.bg, 0.06);

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

    const ambient = new THREE.AmbientLight(CONFIG.color.bg, 0.6);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(CONFIG.color.light, 0.8);
    dir.position.set(6, 10, 4);
    this.scene.add(dir);
  }

  createArtifact() {
    this.artifact = new THREE.Group();

    // VERY faint line material
    const lineMat = new THREE.LineBasicMaterial({
      color: CONFIG.color.object,
      transparent: true,
      opacity: 0.08,
      linewidth: 1
    });

    const heavyMat = new THREE.LineBasicMaterial({
      color: CONFIG.color.object,
      transparent: true,
      opacity: 0.16,
      linewidth: 1
    });

    // MONOLITH (vertical structure)
    const boxGeo = new THREE.BoxGeometry(2, 4, 2);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    this.monolith = new THREE.LineSegments(boxEdges, lineMat);
    this.artifact.add(this.monolith);

    // CORE (floating poly)
    const coreGeo = new THREE.OctahedronGeometry(0.55, 0);
    this.core = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), heavyMat);
    this.core.position.y = 0.8;
    this.artifact.add(this.core);

    // SMALL CELESTIAL ARC (reduced so it doesn't crash into the header)
    const arcGeo = new THREE.TorusGeometry(2.2, 0.01, 3, 80, Math.PI * 1.3);
    this.arc = new THREE.LineSegments(new THREE.EdgesGeometry(arcGeo), heavyMat);
    this.arc.rotation.z = 0;          // upright
    this.arc.position.y = 1.4;
    this.artifact.add(this.arc);

    // Scale and lower the whole artifact a bit
    this.artifact.scale.set(0.75, 0.75, 0.75);
    this.artifact.position.y = -0.2;

    this.scene.add(this.artifact);
  }

  addAtmosphere() {
    const count = 160;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 14;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x000000,
      size: 0.018,
      transparent: true,
      opacity: 0.12
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  bindEvents() {
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

    // Inner scroll nav
    const contentColumn = document.querySelector(".content-column");
    const links = document.querySelectorAll(".nav-links a");

    if (contentColumn && links.length) {
      links.forEach((link) => {
        link.addEventListener("click", (ev) => {
          ev.preventDefault();
          const id = link.getAttribute("href").slice(1);
          const target = document.getElementById(id);
          if (!target) return;

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        });
      });
    }
  }

  render() {
    const time = Date.now() * 0.0005;

    if (this.artifact) {
      this.artifact.rotation.y = time * 0.12;
    }

    if (this.core) {
      this.core.rotation.x = time * 1.1;
      this.core.rotation.z = time * 0.6;
      this.core.position.y = 0.8 + Math.sin(time * 3) * 0.08;
    }

    if (this.particles) {
      this.particles.rotation.y = time * 0.05;
    }

    // Very subtle camera parallax
    this.camera.position.x += (this.mouseX * 0.4 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouseY * 0.3 - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new VoidExperience();
});
