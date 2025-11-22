/**
 * ALCHEMY · THE VOID STATE
 * Architecture-focused refactor:
 * - VoidExperience: 3D environment only
 * - ChamberPanel: chamber UI and content
 * - NavController: wiring nav + URL hash to chambers
 * - AlchemyApp: orchestrator
 */

const CONFIG = {
    colors: {
        bg: 0xEAE8E3,
        lines: 0x111111,
        fog: 0xEAE8E3
    },
    camera: {
        fov: 35,
        z: 14
    },
    motion: {
        lerp: 0.03,
        rotationSpeed: 0.0008
    }
};

/* ---------------------------------------
   LAYER 1 - THE VOID (3D ENVIRONMENT ONLY)
---------------------------------------- */

class VoidExperience {
    constructor(canvasSelector) {
        this.canvas = document.querySelector(canvasSelector);
        if (!this.canvas) return;

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
        this.scene.background = new THREE.Color(CONFIG.colors.bg);
        this.scene.fog = new THREE.FogExp2(CONFIG.colors.fog, 0.06);

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

        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambient);

        const directional = new THREE.DirectionalLight(0xffffff, 0.5);
        directional.position.set(10, 10, 10);
        this.scene.add(directional);
    }

    createArtifact() {
        this.artifactGroup = new THREE.Group();

        const wireMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.lines,
            transparent: true,
            opacity: 0.1
        });

        const structureMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.lines,
            transparent: true,
            opacity: 0.7
        });

        // Monolith
        const boxGeo = new THREE.BoxGeometry(2.2, 4.5, 2.2);
        this.monolith = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), wireMat);
        this.artifactGroup.add(this.monolith);

        // Arc
        const arcGeo = new THREE.TorusGeometry(3.5, 0.02, 16, 100, Math.PI * 1.5);
        this.arc = new THREE.LineSegments(new THREE.EdgesGeometry(arcGeo), structureMat);
        this.arc.rotation.z = Math.PI / 4;
        this.artifactGroup.add(this.arc);

        // Core
        const coreGeo = new THREE.IcosahedronGeometry(0.6, 0);
        this.core = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), structureMat);
        this.artifactGroup.add(this.core);

        // Grid
        const gridGeo = new THREE.PlaneGeometry(25, 25, 20, 20);
        const grid = new THREE.LineSegments(new THREE.EdgesGeometry(gridGeo), wireMat);
        grid.rotation.x = Math.PI / 2;
        grid.position.y = -3;
        this.artifactGroup.add(grid);

        this.scene.add(this.artifactGroup);
    }

    addAtmosphere() {
        const count = 300;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 20;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: CONFIG.colors.lines,
            size: 0.03,
            transparent: true,
            opacity: 0.15
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width, this.height);
        });

        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / this.width) * 2 - 1;
            this.mouseY = -(e.clientY / this.height) * 2 + 1;
        });
    }

    render() {
        const time = Date.now() * CONFIG.motion.rotationSpeed;

        // Group rotation
        if (this.artifactGroup) {
            this.artifactGroup.rotation.y = Math.sin(time * 0.5) * 0.2;
        }

        // Core breathing
        if (this.core) {
            this.core.rotation.x = time * 2;
            this.core.rotation.y = time;

            this.core.position.y = Math.sin(Date.now() * 0.002) * 0.15;
            const scale = 1 + Math.sin(Date.now() * 0.0015) * 0.05;
            this.core.scale.set(scale, scale, scale);
        }

        // Arc rotation
        if (this.arc) {
            this.arc.rotation.z += 0.001;
        }

        // Camera inertia
        const targetX = this.mouseX * 0.8;
        const targetY = this.mouseY * 0.8;

        this.camera.position.x += (targetX - this.camera.position.x) * CONFIG.motion.lerp;
        this.camera.position.y += (targetY - this.camera.position.y) * CONFIG.motion.lerp;
        this.camera.lookAt(0, 0, 0);

        // Particles drift
        if (this.particles) {
            this.particles.rotation.y = time * 0.1;
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

/* ---------------------------------------
   LAYER 2 - CHAMBER MODEL + PANEL
---------------------------------------- */

const CHAMBERS = {
    philosophy: {
        label: 'Chamber I · The Thesis',
        title: 'What the system believes about the world.',
        paragraphs: [
            'Every system inherits a worldview. The code is merely the enforcement mechanism of a philosophy.',
            'We ask questions of value, time, and consequence: who does this tool serve, what does it conserve, and what does it quietly destroy in the pursuit of efficiency?'
        ]
    },
    systems: {
        label: 'Chamber II · The Engine',
        title: 'Architecture that carries the weight.',
        paragraphs: [
            'This is the domain of protocols, feedback loops, and observability. The boring parts that determine longevity.',
            'We prefer designs that can be explained on a single sheet of paper. Complexity is not a sign of intelligence; it is often a sign of unresolved conflict.'
        ]
    },
    artifacts: {
        label: 'Chamber III · The Surface',
        title: 'Objects that survive strange weather.',
        paragraphs: [
            'Eventually, abstract logic must condense into artifacts: interfaces, dashboards, devices, and scripts.',
            'The work here is execution with disproportionate care. We focus on ergonomics, legibility, and the quiet discipline of removing noise until only the signal remains.'
        ]
    },
    oracle: {
        label: 'Chamber IV · The Forecast',
        title: 'Structured doubt for irreversible decisions.',
        paragraphs: [
            'Where information becomes counsel. We use simulations and sensitivity analysis to map the terrain before walking it.',
            'The goal is not prediction theater, but better questions. We measure twice so we only have to cut once.'
        ]
    }
};

class ChamberPanel {
    constructor(options) {
        this.panel = document.querySelector(options.panelSelector);
        if (!this.panel) return;

        this.labelEl = this.panel.querySelector('.chamber-label');
        this.titleEl = this.panel.querySelector('.chamber-title');
        this.bodyEl = this.panel.querySelector('.chamber-content');
        this.closeBtn = this.panel.querySelector('.chamber-close');

        this.data = options.data || {};
        this.currentKey = null;

        this.bindEvents();
    }

    bindEvents() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        this.panel.addEventListener('click', (e) => {
            if (e.target === this.panel) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }

    open(key) {
        const data = this.data[key];
        if (!data) return;

        this.currentKey = key;

        this.labelEl.textContent = data.label;
        this.titleEl.textContent = data.title;

        this.bodyEl.innerHTML = '';
        data.paragraphs.forEach(text => {
            const p = document.createElement('p');
            p.textContent = text;
            this.bodyEl.appendChild(p);
        });

        this.panel.classList.remove('chamber-panel--hidden');
        this.panel.classList.add('chamber-panel--visible');
        this.panel.setAttribute('aria-hidden', 'false');
    }

    close() {
        this.currentKey = null;
        this.panel.classList.remove('chamber-panel--visible');
        this.panel.classList.add('chamber-panel--hidden');
        this.panel.setAttribute('aria-hidden', 'true');
    }
}

/* ---------------------------------------
   LAYER 3 - NAV + ROUTING + ORCHESTRATOR
---------------------------------------- */

class NavController {
    constructor(options) {
        this.links = Array.from(document.querySelectorAll(options.linkSelector));
        this.onSelect = options.onSelect;
        this.currentKey = null;

        this.bindEvents();
    }

    bindEvents() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const key = link.getAttribute('data-chamber');
                if (!key) return;
                this.setActive(key);
                if (this.onSelect) this.onSelect(key);
                const route = link.getAttribute('data-route');
                if (route) {
                    window.location.hash = route;
                }
            });
        });

        window.addEventListener('hashchange', () => {
            this.syncWithHash();
        });
    }

    setActive(key) {
        this.currentKey = key;
        this.links.forEach(link => {
            const linkKey = link.getAttribute('data-chamber');
            link.classList.toggle('active', linkKey === key);
        });
    }

    syncWithHash() {
        const hash = window.location.hash.replace('#', '');
        if (!hash) return;

        const match = this.links.find(
            link => link.getAttribute('data-route') === hash
        );

        if (!match) return;

        const key = match.getAttribute('data-chamber');
        if (!key) return;

        this.setActive(key);
        if (this.onSelect) this.onSelect(key);
    }
}

class AlchemyApp {
    constructor() {
        this.void = new VoidExperience('#artifact-canvas');

        this.chambers = new ChamberPanel({
            panelSelector: '#chamber-panel',
            data: CHAMBERS
        });

        this.nav = new NavController({
            linkSelector: '.nav-link',
            onSelect: (key) => {
                if (!this.chambers) return;
                this.chambers.open(key);
            }
        });

        // On initial load, if hash is present, sync to that
        this.bootFromHash();
    }

    bootFromHash() {
        const hash = window.location.hash.replace('#', '');
        if (!hash) return;

        const link = document.querySelector(
            `.nav-link[data-route="${hash}"]`
        );
        if (!link) return;

        const key = link.getAttribute('data-chamber');
        if (!key) return;

        this.nav.setActive(key);
        this.chambers.open(key);
    }
}

/* Boot */
window.addEventListener('DOMContentLoaded', () => {
    new AlchemyApp();
});
