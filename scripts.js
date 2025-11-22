/**
 * ALCHEMYIN · CARD IN THE VOID
 * Subtle 3D artifact + single cardstock card updated by nav.
 */

const CONFIG = {
    color: {
        bg: 0xe3dfd7,
        object: 0x15110d,
        light: 0xffffff
    },
    camera: {
        fov: 35,
        z: 13
    }
};

class VoidArtifact {
    constructor() {
        this.canvas = document.getElementById("artifact-canvas");
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

        const ambient = new THREE.AmbientLight(CONFIG.color.bg, 0.7);
        this.scene.add(ambient);

        const dir = new THREE.DirectionalLight(CONFIG.color.light, 0.75);
        dir.position.set(6, 10, 4);
        this.scene.add(dir);
    }

    createArtifact() {
        this.artifact = new THREE.Group();

        const faintLine = new THREE.LineBasicMaterial({
            color: CONFIG.color.object,
            transparent: true,
            opacity: 0.16,
            linewidth: 1
        });

        const strongLine = new THREE.LineBasicMaterial({
            color: CONFIG.color.object,
            transparent: true,
            opacity: 0.35,
            linewidth: 1
        });

        // Vertical monolith (architectural column)
        const monoGeo = new THREE.BoxGeometry(2.1, 4.4, 1.4);
        const monoEdges = new THREE.EdgesGeometry(monoGeo);
        this.monolith = new THREE.LineSegments(monoEdges, faintLine);
        this.monolith.position.set(0, -0.2, 0);
        this.artifact.add(this.monolith);

        // Core polyhedron (intelligence)
        const coreGeo = new THREE.OctahedronGeometry(0.7, 0);
        const coreEdges = new THREE.EdgesGeometry(coreGeo);
        this.core = new THREE.LineSegments(coreEdges, strongLine);
        this.core.position.set(0, 0.7, 0);
        this.artifact.add(this.core);

        // Halo arc (celestial curve)
        const arcGeo = new THREE.TorusGeometry(3.2, 0.01, 3, 80, Math.PI * 1.4);
        const arcEdges = new THREE.EdgesGeometry(arcGeo);
        this.arc = new THREE.LineSegments(arcEdges, faintLine);
        this.arc.rotation.z = Math.PI / 2;
        this.arc.position.set(0, 1.2, 0);
        this.artifact.add(this.arc);

        // Subtle ground plane (faint horizon)
        const planeGeo = new THREE.PlaneGeometry(18, 18, 10, 10);
        const planeEdges = new THREE.EdgesGeometry(planeGeo);
        this.ground = new THREE.LineSegments(
            planeEdges,
            new THREE.LineBasicMaterial({
                color: CONFIG.color.object,
                transparent: true,
                opacity: 0.08
            })
        );
        this.ground.rotation.x = Math.PI / 2;
        this.ground.position.y = -2.6;
        this.artifact.add(this.ground);

        this.artifact.scale.set(0.85, 0.85, 0.85);
        this.scene.add(this.artifact);
    }

    addAtmosphere() {
        const count = 150;
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            pos[i] = (Math.random() - 0.5) * 16;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

        const mat = new THREE.PointsMaterial({
            color: 0x000000,
            size: 0.02,
            transparent: true,
            opacity: 0.18
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

        document.addEventListener("mousemove", (event) => {
            this.mouseX = (event.clientX / this.width) * 2 - 1;
            this.mouseY = -(event.clientY / this.height) * 2 + 1;
        });
    }

    render() {
        const time = Date.now() * 0.0004;

        if (this.artifact) {
            this.artifact.rotation.y = time * 0.25;
        }

        if (this.core) {
            this.core.rotation.x = time * 1.1;
            this.core.rotation.z = time * 0.6;
            this.core.position.y = 0.7 + Math.sin(time * 3) * 0.08;
        }

        if (this.particles) {
            this.particles.rotation.y = time * 0.12;
        }

        this.camera.position.x += (this.mouseX * 0.4 - this.camera.position.x) * 0.04;
        this.camera.position.y += (this.mouseY * 0.3 - this.camera.position.y) * 0.04;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

/* --------- CARD CONTENT SYSTEM --------- */

const CHAMBERS = {
    foyer: {
        label: "Foyer",
        title: "A quiet room for serious work.",
        paragraphs: [
            "Alchemyin is a small, independent studio at the intersection of philosophy, systems design, and instrument building. The outer surface looks minimal. The inner surface is all detail: notation, structure, and long-term thinking."
        ]
    },
    philosophy: {
        label: "Chamber I • Philosophy",
        title: "What a system believes about the world.",
        paragraphs: [
            "Every system inherits a worldview, whether it admits it or not. This is where we make that explicit.",
            "We work with questions of value, time, responsibility, and power: who the tool serves, what it conserves, and what it quietly destroys."
        ]
    },
    systems: {
        label: "Chamber II • Systems",
        title: "The architecture that carries the weight.",
        paragraphs: [
            "Interfaces, protocols, automation, feedback loops, and observability. The supposedly boring parts that decide whether something lasts.",
            "We prefer designs that can be explained on a single sheet of paper and maintained without heroics."
        ]
    },
    artifacts: {
        label: "Chamber III • Artifacts",
        title: "Surfaces that survive strange weather.",
        paragraphs: [
            "Eventually everything condenses into artifacts: tools, dashboards, documents, devices, small scripts.",
            "The work here is execution with disproportionate care: ergonomics, legibility, and the discipline of not adding noise."
        ]
    },
    oracle: {
        label: "Chamber IV • Oracle",
        title: "Structured doubt for irreversible decisions.",
        paragraphs: [
            "This is the layer where information becomes counsel: simulations, scenario maps, and sensitivity analysis.",
            "The goal is not prediction theater, but better questions before committing to moves that are expensive to reverse."
        ]
    }
};

function initCardContent() {
    const cardLabel = document.getElementById("card-label");
    const cardTitle = document.getElementById("card-title");
    const cardBody = document.getElementById("card-body");
    const navLinks = document.querySelectorAll(".nav-link");

    if (!cardLabel || !cardTitle || !cardBody || !navLinks.length) return;

    function renderChamber(key) {
        const chamber = CHAMBERS[key];
        if (!chamber) return;

        cardLabel.textContent = chamber.label;
        cardTitle.textContent = chamber.title;

        cardBody.innerHTML = "";
        chamber.paragraphs.forEach((para) => {
            const p = document.createElement("p");
            p.textContent = para;
            cardBody.appendChild(p);
        });

        navLinks.forEach((link) => {
            const chamberKey = link.getAttribute("data-chamber");
            if (chamberKey === key) {
                link.classList.add("nav-link--active");
            } else {
                link.classList.remove("nav-link--active");
            }
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const key = link.getAttribute("data-chamber");
            if (key) {
                renderChamber(key);
            }
        });
    });

    // initial state: foyer text, no active chamber
    renderChamber("foyer");
}

/* Boot */

window.addEventListener("DOMContentLoaded", () => {
    new VoidArtifact();
    initCardContent();
});
