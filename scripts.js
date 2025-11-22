/**
 * ALCHEMYIN CORE OS
 * Void environment + chamber / depth overlay system
 */

const CONFIG = {
    colors: {
        bg: 0xEAE8E3,
        object: 0x111111,
        light: 0xffffff
    },
    camera: {
        fov: 35,
        z: 12
    },
    motion: {
        parallax: 0.5,
        lerp: 0.05,
        artifactSpin: 0.08,
        coreSpinX: 0.6,
        coreSpinZ: 0.3,
        coreBobAmp: 0.12,
        coreBobFreq: 2.2
    }
};

/* ---------- VOID EXPERIENCE (3D CONTEXT) ---------- */

class VoidExperience {
    constructor(selector = '#artifact-canvas') {
        this.canvas = document.querySelector(selector);
        if (!this.canvas || typeof THREE === 'undefined') return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.mouseX = 0;
        this.mouseY = 0;

        this.render = this.render.bind(this);

        this.init();
        this.createArtifact();
        this.addAtmosphere();
        this.bindEvents();
        this.render();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.bg);
        this.scene.fog = new THREE.FogExp2(CONFIG.colors.bg, 0.08);

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

        const ambient = new THREE.AmbientLight(CONFIG.colors.light, 0.7);
        this.scene.add(ambient);

        const directional = new THREE.DirectionalLight(CONFIG.colors.light, 0.55);
        directional.position.set(6, 10, 6);
        this.scene.add(directional);
    }

    createArtifact() {
        this.artifact = new THREE.Group();

        const lineMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.object,
            transparent: true,
            opacity: 0.16
        });

        const heavyMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.object,
            transparent: true,
            opacity: 0.82
        });

        // ARC (Celestial, unfinished circle)
        const arcGeo = new THREE.TorusGeometry(3, 0.01, 3, 100, Math.PI * 1.5);
        this.arc = new THREE.LineSegments(new THREE.EdgesGeometry(arcGeo), heavyMat);
        this.arc.rotation.z = Math.PI / 4;
        this.artifact.add(this.arc);

        // MONOLITH (Structure)
        const boxGeo = new THREE.BoxGeometry(2, 4, 2);
        const boxEdges = new THREE.EdgesGeometry(boxGeo);
        this.monolith = new THREE.LineSegments(boxEdges, lineMat);
        this.artifact.add(this.monolith);

        // CORE (Center)
        const coreGeo = new THREE.OctahedronGeometry(0.5, 0);
        this.core = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), heavyMat);
        this.artifact.add(this.core);

        // HORIZON (Context)
        const gridGeo = new THREE.PlaneGeometry(20, 20, 20, 20);
        const gridEdges = new THREE.EdgesGeometry(gridGeo);
        this.grid = new THREE.LineSegments(gridEdges, lineMat);
        this.grid.rotation.x = Math.PI / 2;
        this.grid.position.y = -2.5;
        this.artifact.add(this.grid);

        this.scene.add(this.artifact);
    }

    addAtmosphere() {
        const count = 220;
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            pos[i] = (Math.random() - 0.5) * 15;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color: CONFIG.colors.object,
            size: 0.02,
            transparent: true,
            opacity: 0.2
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
        const time = Date.now() * 0.001;

        if (this.artifact) {
            this.artifact.rotation.y = time * CONFIG.motion.artifactSpin * 0.1;
        }

        if (this.core) {
            this.core.rotation.x = time * CONFIG.motion.coreSpinX;
            this.core.rotation.z = time * CONFIG.motion.coreSpinZ;
            this.core.position.y = Math.sin(time * CONFIG.motion.coreBobFreq) * CONFIG.motion.coreBobAmp;
        }

        if (this.particles) {
            this.particles.rotation.y = time * 0.05;
        }

        const targetX = this.mouseX * CONFIG.motion.parallax;
        const targetY = this.mouseY * CONFIG.motion.parallax;

        this.camera.position.x += (targetX - this.camera.position.x) * CONFIG.motion.lerp;
        this.camera.position.y += (targetY - this.camera.position.y) * CONFIG.motion.lerp;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render);
    }
}

/* ---------- DATA LAYER: CHAMBERS & DOCUMENTS ---------- */

const CHAMBERS = {
    philosophy: {
        label: 'Chamber I · Philosophy',
        title: 'What a system assumes about the world.',
        paragraphs: [
            'Every tool encodes a set of assumptions. This chamber is where those assumptions are made explicit instead of living quietly in the background.',
            'We ask: under what conditions does this model still hold, and who carries the cost when it stops?'
        ]
    },
    systems: {
        label: 'Chamber II · Systems',
        title: 'The architecture that carries the weight.',
        paragraphs: [
            'Interfaces, protocols, automation, and observability. The invisible structure that determines whether an idea survives contact with real environments.',
            'We prefer systems that can be explained on a single sheet of paper and maintained by ordinary people, not heroes.'
        ]
    },
    artifacts: {
        label: 'Chamber III · Artifacts',
        title: 'Surfaces built to survive strange weather.',
        paragraphs: [
            'Eventually abstraction becomes matter: devices, dashboards, scripts, field tools. This is the layer where ideas accept the constraints of hardware, time, and exhaustion.',
            'The emphasis is on ergonomics, legibility, and removing everything that does not directly serve use in the field.'
        ]
    },
    oracle: {
        label: 'Chamber IV · Oracle',
        title: 'Structured doubt for irreversible moves.',
        paragraphs: [
            'We treat forecasting as disciplined doubt rather than performance. Scenarios, sensitivities, and envelopes of failure, instead of single-line predictions.',
            'The goal is to map the terrain before walking it, so that when we do commit, we know what we are trading for what.'
        ]
    }
};

/* Example document scaffold for future depth view */
const DOCUMENTS = {
    // Example: a future internal paper
    'american-favela': {
        kicker: 'Field Note · AF-01',
        title: 'The American Favela Thesis',
        subtitle: 'Notes on infrastructure, precarity, and tools that do not assume stability.',
        sections: [
            {
                heading: '1. Scope',
                paragraphs: [
                    'This document sketches the constraints of operating in environments where formal infrastructure is intermittent, informal, or adversarial.',
                    'It exists to inform how devices, drones, and software should behave when continuity cannot be assumed.'
                ]
            },
            {
                heading: '2. Design Pressure',
                paragraphs: [
                    'Tools built for unstable contexts must prioritise recoverability, offline usefulness, and graceful degradation over marginal gains in ideal conditions.'
                ]
            }
        ]
    }
};

/* ---------- NAVIGATION CONTROLLER ---------- */

class NavController {
    constructor({ linkSelector }) {
        this.links = Array.from(document.querySelectorAll(linkSelector));
        this.bind();
    }

    bind() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = link.dataset.route || link.getAttribute('href').replace('#', '');
                if (route) {
                    window.location.hash = route;
                }
            });
        });
    }

    setActiveByChamber(key) {
        this.links.forEach(link => {
            const chamber = link.getAttribute('data-chamber');
            if (chamber === key) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    clearActive() {
        this.links.forEach(link => link.classList.remove('active'));
    }
}

/* ---------- CHAMBER PANEL (SECTION-LEVEL BRIEFING) ---------- */

class ChamberPanel {
    constructor({ panelSelector, data, onRequestClose }) {
        this.root = document.querySelector(panelSelector);
        if (!this.root) return;

        this.data = data || {};
        this.onRequestClose = onRequestClose;

        this.labelEl = this.root.querySelector('.chamber-label');
        this.titleEl = this.root.querySelector('.chamber-title');
        this.bodyEl = this.root.querySelector('.chamber-body');
        this.closeBtn = this.root.querySelector('.chamber-close');

        this.currentKey = null;

        this.bind();
    }

    bind() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.requestClose());
        }

        this.root.addEventListener('click', (e) => {
            if (e.target === this.root) {
                this.requestClose();
            }
        });
    }

    requestClose() {
        if (typeof this.onRequestClose === 'function') {
            this.onRequestClose();
        }
    }

    open(key) {
        const data = this.data[key];
        if (!data) return;

        this.currentKey = key;

        if (this.labelEl) this.labelEl.textContent = data.label || '';
        if (this.titleEl) this.titleEl.textContent = data.title || '';

        if (this.bodyEl) {
            this.bodyEl.innerHTML = '';
            (data.paragraphs || []).forEach(text => {
                const p = document.createElement('p');
                p.textContent = text;
                this.bodyEl.appendChild(p);
            });
        }

        this.root.classList.remove('chamber-panel--hidden');
        this.root.classList.add('chamber-panel--visible');
        this.root.setAttribute('aria-hidden', 'false');
        document.body.classList.add('chamber-open');
        document.body.classList.remove('depth-open');
    }

    close() {
        this.currentKey = null;
        this.root.classList.remove('chamber-panel--visible');
        this.root.classList.add('chamber-panel--hidden');
        this.root.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('chamber-open');
    }
}

/* ---------- DEPTH VIEW (LONG-FORM DOCUMENTS / ARCHIVE) ---------- */

class DepthView {
    constructor({ panelSelector, data, onRequestClose }) {
        this.root = document.querySelector(panelSelector);
        if (!this.root) return;

        this.data = data || {};
        this.onRequestClose = onRequestClose;

        this.kickerEl = this.root.querySelector('.depth-kicker');
        this.titleEl = this.root.querySelector('.depth-title');
        this.subtitleEl = this.root.querySelector('.depth-subtitle');
        this.bodyEl = this.root.querySelector('.depth-body');
        this.closeBtn = this.root.querySelector('.depth-close');

        this.currentId = null;

        this.bind();
    }

    bind() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.requestClose());
        }

        this.root.addEventListener('click', (e) => {
            if (e.target === this.root) {
                this.requestClose();
            }
        });
    }

    requestClose() {
        if (typeof this.onRequestClose === 'function') {
            this.onRequestClose();
        }
    }

    open(id) {
        const doc = this.data[id];
        if (!doc) return;

        this.currentId = id;

        if (this.kickerEl) this.kickerEl.textContent = doc.kicker || '';
        if (this.titleEl) this.titleEl.textContent = doc.title || '';
        if (this.subtitleEl) this.subtitleEl.textContent = doc.subtitle || '';

        if (this.bodyEl) {
            this.bodyEl.innerHTML = '';
            (doc.sections || []).forEach(section => {
                if (section.heading) {
                    const h = document.createElement('h3');
                    h.textContent = section.heading;
                    this.bodyEl.appendChild(h);
                }
                (section.paragraphs || []).forEach(text => {
                    const p = document.createElement('p');
                    p.textContent = text;
                    this.bodyEl.appendChild(p);
                });
            });
        }

        this.root.classList.remove('depth-view--hidden');
        this.root.classList.add('depth-view--visible');
        this.root.setAttribute('aria-hidden', 'false');
        document.body.classList.add('depth-open');
        document.body.classList.remove('chamber-open');
    }

    close() {
        this.currentId = null;
        this.root.classList.remove('depth-view--visible');
        this.root.classList.add('depth-view--hidden');
        this.root.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('depth-open');
    }
}

/* ... [KEEP ALL EXISTING JAVASCRIPT ABOVE THIS LINE] ... */

/* ---------- APP ORCHESTRATOR ---------- */

class AlchemyApp {
    constructor() {
        this.state = {
            mode: 'idle',      // 'idle' | 'chamber' | 'depth'
            chamber: null,
            docId: null
        };

        this.voidExperience = new VoidExperience('#artifact-canvas');

        this.nav = new NavController({
            linkSelector: '.nav-links .link'
        });

        this.chambers = new ChamberPanel({
            panelSelector: '#chamber-panel',
            data: CHAMBERS,
            onRequestClose: () => {
                if (window.location.hash) {
                    window.location.hash = '';
                }
            }
        });

        this.depthView = new DepthView({
            panelSelector: '#depth-view',
            data: DOCUMENTS,
            onRequestClose: () => {
                if (window.location.hash) {
                    window.location.hash = '';
                }
            }
        });

        /* header element for logo state (no longer needed for class toggling) */
        // this.header = document.querySelector('.header-layer');

        window.addEventListener('hashchange', () => this.handleHash());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && window.location.hash) {
                window.location.hash = '';
            }
        });

        this.handleHash(); // initial load
    }

    // REMOVED: setHeaderCompact is no longer necessary as CSS uses body classes.

    handleHash() {
        const raw = window.location.hash.replace(/^#/, '').trim();

        if (!raw) {
            this.goIdle();
            return;
        }
// ... (rest of handleHash remains the same)

        // Document route: #doc/<id>
        if (raw.startsWith('doc/')) {
            const id = raw.slice(4);
            if (DOCUMENTS[id]) {
                this.openDocument(id);
            } else {
                this.goIdle();
            }
            return;
        }

        // Chamber route: #philosophy, #systems, etc.
        if (CHAMBERS[raw]) {
            this.openChamber(raw);
            return;
        }

        // Unknown route → idle
        this.goIdle();
    }

    goIdle() {
        this.state.mode = 'idle';
        this.state.chamber = null;
        this.state.docId = null;

        this.nav.clearActive();
        if (this.chambers) this.chambers.close(); // ChamberPanel.close removes .chamber-open
        if (this.depthView) this.depthView.close(); // DepthView.close removes .depth-open

        // this.setHeaderCompact(false); // REMOVED
    }

    openChamber(key) {
        if (!this.chambers) return;

        this.state.mode = 'chamber';
        this.state.chamber = key;
        this.state.docId = null;

        if (this.depthView) this.depthView.close();
        this.nav.setActiveByChamber(key);
        this.chambers.open(key); // ChamberPanel.open adds .chamber-open

        // this.setHeaderCompact(true); // REMOVED
    }

    openDocument(id) {
        if (!this.depthView) return;

        this.state.mode = 'depth';
        this.state.docId = id;
        this.state.chamber = null;

        if (this.chambers) this.chambers.close();
        this.nav.clearActive();
        this.depthView.open(id); // DepthView.open adds .depth-open

        // this.setHeaderCompact(true); // REMOVED
    }
}

/* ---------- BOOT ---------- */

window.addEventListener('DOMContentLoaded', () => {
    new AlchemyApp();
});
