/**
 * ALCHEMYIN CORE OS v2.0
 * Precision-refined void environment with enhanced orchestration
 */

// Feature detection and progressive enhancement
const SUPPORTS = {
    cssVariables: typeof CSS !== 'undefined' && CSS.supports && CSS.supports('color', 'var(--test)'),
    importMaps: 'importMap' in document.createElement('script'),
    backdropFilter: typeof CSS !== 'undefined' && CSS.supports('backdrop-filter: blur(1px)'),
    pointerEvents: typeof window !== 'undefined' && 'PointerEvent' in window
};

// Global configuration
const CONFIG = {
    colors: {
        bg: 0xEAE8E3,
        object: 0x111111,
        light: 0xffffff,
        accent: 0x2A2A2A
    },
    camera: {
        fov: 32,
        near: 0.1,
        far: 100,
        z: 14
    },
    motion: {
        parallax: 0.22,
        lerp: 0.09,
        artifactSpin: 0.035,
        coreSpinX: 0.35,
        coreSpinZ: 0.18,
        coreBobAmp: 0.07,
        coreBobFreq: 1.7,
        particleDrift: 0.018
    },
    artifact: {
        radius: 3.4,
        tube: 0.72,
        segments: 96,
        tubeSegments: 20
    },
    particles: {
        count: 240,
        spread: 8
    }
};

// Chamber definitions
const CHAMBERS = {
    philosophy: {
        label: 'Chamber I',
        name: 'Philosophy',
        title: 'The questions that survive contact with reality.',
        body: [
            'We begin with models, not slogans. Questions that refuse to die after contact with experiments, founders, markets, and history.',
            'Alchemy is the study of how an idea maintains coherence while the world pushes back. How a hypothesis behaves when it is no longer alone in a notebook.'
        ]
    },
    systems: {
        label: 'Chamber II',
        name: 'Systems',
        title: 'The architecture that carries the weight.',
        body: [
            'Interfaces, protocols, automation, and observability. The invisible structure that determines whether an idea survives contact with real environments.',
            'We prefer systems that can be explained on a single sheet of paper and maintained by ordinary people, not heroes.'
        ]
    },
    artifacts: {
        label: 'Chamber III',
        name: 'Artifacts',
        title: 'Tools that make the model unavoidable.',
        body: [
            'Instruments, dashboards, and devices that surface the true state of the system. The quiet hardware and software that make it difficult to lie to yourself.',
            'Each artifact is designed to be legible in a crisis: “what is happening, what can fail next, and what can we do about it now?”'
        ]
    },
    oracle: {
        label: 'Chamber IV',
        name: 'Oracle',
        title: 'Signals that update the model.',
        body: [
            'Every system drifts. Data, anomalies, and field reports are how the model learns to track the world it claims to describe.',
            'We care less about prediction and more about calibration: how quickly a map can admit it is wrong and redraw itself.'
        ]
    }
};

// Document-level depth content
const DOCUMENTS = {
    systems: {
        chamber: 'Chamber II · Systems',
        title: 'Systems that survive ordinary failure modes.',
        paragraphs: [
            'We design for the kind of failure that happens on Tuesday afternoons when no one is watching. Not the cinematic outage with a war room and a press release, but the quiet misconfigurations, missing alerts, and unowned corners that slowly rot the model.',
            'The baseline expectation: every critical system can be understood by a new operator in under an hour, debugged in the dark with a single terminal, and restored from a single sheet of paper.',
            'Interfaces are treated as contracts, not suggestions. Every boundary has an explicit vocabulary, versioning strategy, and failure story. When two systems disagree, the responsibility for reconciliation belongs somewhere concrete.'
        ]
    },
    philosophy: {
        chamber: 'Chamber I · Philosophy',
        title: 'Thinking in models, not moods.',
        paragraphs: [
            'We treat beliefs as objects that can be versioned, tested, and retired. A model is only interesting to the extent that it changes what you would do on Monday morning.',
            'Most philosophy in the wild optimizes for elegance; we optimize for survivability. A clean theory that cannot survive contact with the cash flow statement, the latency graph, or the factory floor is just decoration.',
            'The question we keep asking: if this model were fully true, where would it break first?'
        ]
    },
    artifacts: {
        chamber: 'Chamber III · Artifacts',
        title: 'Interfaces as field instruments.',
        paragraphs: [
            'A good artifact does not explain itself; it makes the state of the world obvious. The operator should feel less like they are “using software” and more like they are placing their hand on the live circuit of the system.',
            'We bias toward instruments that compress time: showing leading indicators instead of lagging stories, deltas instead of snapshots, and gradients instead of absolutes.',
            'We care about the specific affordances: what is one single action that becomes dramatically easier when the artifact exists?'
        ]
    },
    oracle: {
        chamber: 'Chamber IV · Oracle',
        title: 'Feedback as operating discipline.',
        paragraphs: [
            'Prediction is entertainment; calibration is discipline. The oracle exists to keep the model embarrassingly honest about where it fails.',
            'We catalogue breaks between the map and the territory: mispredictions, weird outliers, and events we did not know how to parse. The point is not to avoid error but to metabolize it faster than the environment changes.',
            'Every time reality surprises us, something in the stack must update: the dashboard, the alerting, the narrative, or the underlying model. Nothing is allowed to stay stale and authoritative at the same time.'
        ]
    }
};

// State machine for precise application states
const APP_STATES = {
    IDLE: 'idle',
    CHAMBER_OPEN: 'chamber_open',
    DEPTH_OPEN: 'depth_open',
    LOADING: 'loading',
    ERROR: 'error'
};

/**
 * Enhanced VoidExperience with delta timing and performance optimization
 */
class VoidExperience {
    constructor(selector = '#artifact-canvas') {
        this.canvas = document.querySelector(selector);
        if (!this.canvas) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;

        this.artifact = null;
        this.particles = null;
        this.lightGroup = null;

        this.pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.resizeObserver = null;
        this.isInitialized = false;

        this.init();
    }

    init() {
        try {
            this.initScene();
            this.initCamera();
            this.initRenderer();
            this.initLights();
            this.initArtifact();
            this.initParticles();
            this.initEvents();

            this.clock = new THREE.Clock();
            this.isInitialized = true;
            this.animate();
        } catch (error) {
            console.error('VoidExperience initialization failed:', error);
        }
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.bg);
    }

    initCamera() {
        const { fov, near, far, z } = CONFIG.camera;
        this.camera = new THREE.PerspectiveCamera(
            fov,
            this.canvas.clientWidth / this.canvas.clientHeight,
            near,
            far
        );
        this.camera.position.set(0, 0.5, z);
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false
        });

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight, false);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
    }

    initLights() {
        this.lightGroup = new THREE.Group();

        // Main key light
        const keyLight = new THREE.DirectionalLight(CONFIG.colors.light, 1.0);
        keyLight.position.set(3, 6, 4);
        this.lightGroup.add(keyLight);

        // Subtle fill light
        const fillLight = new THREE.DirectionalLight(CONFIG.colors.light, 0.4);
        fillLight.position.set(-4, -1, -4);
        this.lightGroup.add(fillLight);

        // Rim light
        const rimLight = new THREE.PointLight(CONFIG.colors.light, 0.35, 40);
        rimLight.position.set(0, 5, -6);
        this.lightGroup.add(rimLight);

        this.scene.add(this.lightGroup);
    }

    createTorusFrame(radius, tube, radialSegments, tubularSegments, material) {
        const geom = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
        const mesh = new THREE.Mesh(geom, material);
        return mesh;
    }

    createOrbSphere(radius, material) {
        const geom = new THREE.SphereGeometry(radius, 36, 24);
        const mesh = new THREE.Mesh(geom, material);
        return mesh;
    }

    initArtifact() {
        this.artifact = new THREE.Group();

        // Enhanced material system
        const lineMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.object,
            transparent: true,
            opacity: 0.3
        });

        const shellMat = new THREE.MeshPhysicalMaterial({
            color: CONFIG.colors.object,
            metalness: 0.85,
            roughness: 0.18,
            transmission: 0.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.12,
            sheen: 0.4,
            sheenRoughness: 0.6
        });

        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.25,
            metalness: 0.85,
            emissive: 0x000000
        });

        // Outer frame
        const outerFrame = this.createTorusFrame(
            CONFIG.artifact.radius,
            CONFIG.artifact.tube,
            CONFIG.artifact.segments,
            CONFIG.artifact.tubeSegments,
            shellMat
        );

        // Inner wireframe cage
        const cageGeom = new THREE.IcosahedronGeometry(2.2, 1);
        const cageWire = new THREE.LineSegments(
            new THREE.WireframeGeometry(cageGeom),
            lineMat
        );
        cageWire.position.y = 0.1;

        // Core sphere
        const coreSphere = this.createOrbSphere(1.1, coreMat);

        // Axes frames
        const secondaryFrame = this.createTorusFrame(2.8, 0.06, 64, 120, lineMat);
        secondaryFrame.rotation.x = Math.PI / 2;

        const tertiaryFrame = this.createTorusFrame(2.8, 0.06, 64, 120, lineMat);
        tertiaryFrame.rotation.y = Math.PI / 2;

        this.artifact.add(outerFrame, cageWire, coreSphere, secondaryFrame, tertiaryFrame);
        this.artifact.position.set(0, 0.4, 0);

        this.coreSphere = coreSphere;
        this.cageWire = cageWire;

        this.scene.add(this.artifact);
    }

    initParticles() {
        const particleGeom = new THREE.SphereGeometry(0.035, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({
            color: 0x1a1a1a,
            transparent: true,
            opacity: 0.38
        });

        this.particles = new THREE.Group();

        const spread = CONFIG.particles.spread;
        for (let i = 0; i < CONFIG.particles.count; i++) {
            const mesh = new THREE.Mesh(particleGeom, particleMat);
            mesh.position.set(
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread * 0.65,
                (Math.random() - 0.5) * spread
            );
            mesh.userData.offset = Math.random() * Math.PI * 2;
            mesh.userData.speed = 0.12 + Math.random() * 0.18;
            this.particles.add(mesh);
        }

        this.scene.add(this.particles);
    }

    initEvents() {
        window.addEventListener('resize', () => this.handleResize(), { passive: true });
        window.addEventListener('pointermove', (event) => this.handlePointerMove(event), {
            passive: true
        });

        // Fallback mousemove for older browsers
        if (!SUPPORTS.pointerEvents) {
            window.addEventListener('mousemove', (event) => this.handlePointerMove(event), {
                passive: true
            });
        }
    }

    handleResize() {
        if (!this.camera || !this.renderer) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height, false);
    }

    handlePointerMove(event) {
        const x = event.clientX / window.innerWidth;
        const y = event.clientY / window.innerHeight;

        this.pointer.targetX = (x - 0.5) * 2;
        this.pointer.targetY = (y - 0.5) * 2;
    }

    animate() {
        if (!this.isInitialized) return;

        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        // Lerp pointer for smooth parallax
        this.pointer.x += (this.pointer.targetX - this.pointer.x) * CONFIG.motion.lerp;
        this.pointer.y += (this.pointer.targetY - this.pointer.y) * CONFIG.motion.lerp;

        this.updateArtifact(elapsed, delta);
        this.updateParticles(elapsed, delta);

        this.renderer.render(this.scene, this.camera);
    }

    updateArtifact(time, delta) {
        if (!this.artifact) return;

        const parallaxX = this.pointer.x * CONFIG.motion.parallax;
        const parallaxY = this.pointer.y * CONFIG.motion.parallax;

        this.artifact.rotation.y += CONFIG.motion.artifactSpin * delta;
        this.artifact.rotation.x += CONFIG.motion.artifactSpin * 0.35 * delta;

        this.artifact.rotation.y += parallaxX * 0.12;
        this.artifact.rotation.x += -parallaxY * 0.08;

        if (this.coreSphere) {
            this.coreSphere.rotation.x += CONFIG.motion.coreSpinX * delta;
            this.coreSphere.rotation.z += CONFIG.motion.coreSpinZ * delta;
            this.coreSphere.position.y = 0.2 + Math.sin(time * CONFIG.motion.coreBobFreq) * CONFIG.motion.coreBobAmp;
        }

        if (this.cageWire) {
            this.cageWire.rotation.y -= CONFIG.motion.coreSpinZ * 0.6 * delta;
        }
    }

    updateParticles(time, delta) {
        if (!this.particles) return;

        this.particles.children.forEach((p) => {
            const offset = p.userData.offset;
            const speed = p.userData.speed;

            p.position.x += Math.sin(time * speed + offset) * CONFIG.motion.particleDrift * delta * 60;
            p.position.z += Math.cos(time * speed + offset * 0.7) * CONFIG.motion.particleDrift * delta * 60;
        });
    }
}

/**
 * ALCHEMY OS ORCHESTRATOR
 */
class AlchemyApp {
    constructor() {
        this.root = document.querySelector('.app-root');
        this.viewport = document.querySelector('.viewport');
        this.header = document.querySelector('.header-layer');

        this.navLinks = Array.from(document.querySelectorAll('.link[data-chamber]'));
        this.chamberChips = Array.from(document.querySelectorAll('.chamber-chip[data-chamber]'));

        this.chamberPanel = document.querySelector('.chamber-panel');
        this.chamberSurface = this.chamberPanel?.querySelector('.chamber-surface');
        this.chamberLabelEl = this.chamberPanel?.querySelector('[data-chamber-label]');
        this.chamberNameEl = this.chamberPanel?.querySelector('[data-chamber-name]');
        this.chamberTitleEl = this.chamberPanel?.querySelector('[data-chamber-title]');
        this.chamberBodyEl = this.chamberPanel?.querySelector('[data-chamber-body]');

        this.depthView = document.querySelector('.depth-view');
        this.depthSurface = this.depthView?.querySelector('.depth-surface');
        this.depthChamberEl = this.depthView?.querySelector('[data-depth-chamber]');
        this.depthTitleEl = this.depthView?.querySelector('[data-depth-title]');
        this.depthBodyEl = this.depthView?.querySelector('[data-depth-body]');

        this.state = APP_STATES.IDLE;
        this.activeChamberKey = 'systems';
        this.activeDocumentKey = null;

        this.voidExperience = null;

        this.bootstrap();
    }

    bootstrap() {
        this.root?.setAttribute('data-state', APP_STATES.LOADING);
        document.documentElement.classList.remove('no-js');

        this.voidExperience = new VoidExperience('#artifact-canvas');

        this.syncNavToActive();
        this.bindEvents();

        setTimeout(() => {
            this.root?.setAttribute('data-state', APP_STATES.IDLE);
        }, 600);
    }

    bindEvents() {
        this.navLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const chamberKey = link.dataset.chamber;
                if (!chamberKey) return;
                this.handleChamberSelection(chamberKey);
            });
        });

        this.chamberChips.forEach((chip) => {
            chip.addEventListener('click', () => {
                const chamberKey = chip.dataset.chamber;
                if (!chamberKey) return;
                this.handleChamberSelection(chamberKey, { openPanel: true });
            });
        });

        document.querySelectorAll('[data-action="close-chamber"]').forEach((btn) => {
            btn.addEventListener('click', () => this.closeChamberPanel());
        });

        document.querySelector('[data-action="open-depth"]')?.addEventListener('click', () => {
            if (!this.activeChamberKey) return;
            this.openDepthDocument(this.activeChamberKey);
        });

        document.querySelectorAll('[data-action="close-depth"]').forEach((btn) => {
            btn.addEventListener('click', () => this.closeDepthView());
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                if (this.state === APP_STATES.DEPTH_OPEN) {
                    this.closeDepthView();
                    event.stopPropagation();
                } else if (this.state === APP_STATES.CHAMBER_OPEN) {
                    this.closeChamberPanel();
                    event.stopPropagation();
                }
            }
        });
    }

    handleChamberSelection(chamberKey, options = {}) {
        if (!CHAMBERS[chamberKey]) return;

        this.activeChamberKey = chamberKey;
        this.syncNavToActive();
        this.populateChamberPanel(chamberKey);

        if (options.openPanel) {
            this.openChamberPanel();
        }
    }

    syncNavToActive() {
        this.navLinks.forEach((link) => {
            const isActive = link.dataset.chamber === this.activeChamberKey;
            link.classList.toggle('link--active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });

        this.chamberChips.forEach((chip) => {
            const isActive = chip.dataset.chamber === this.activeChamberKey;
            chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    populateChamberPanel(chamberKey) {
        const data = CHAMBERS[chamberKey];
        if (!data || !this.chamberPanel) return;

        this.chamberLabelEl.textContent = data.label;
        this.chamberNameEl.textContent = data.name;
        this.chamberTitleEl.textContent = data.title;

        this.chamberBodyEl.innerHTML = '';
        data.body.forEach((paragraph) => {
            const p = document.createElement('p');
            p.textContent = paragraph;
            this.chamberBodyEl.appendChild(p);
        });
    }

    openChamberPanel() {
        if (!this.chamberPanel) return;

        this.state = APP_STATES.CHAMBER_OPEN;
        this.root?.setAttribute('data-state', APP_STATES.CHAMBER_OPEN);

        this.chamberPanel.setAttribute('aria-hidden', 'false');
        this.chamberSurface?.focus?.();

        this.updateOverlayState();
    }

    closeChamberPanel() {
        if (!this.chamberPanel) return;

        this.chamberPanel.setAttribute('aria-hidden', 'true');

        if (this.state === APP_STATES.CHAMBER_OPEN) {
            this.state = APP_STATES.IDLE;
            this.root?.setAttribute('data-state', APP_STATES.IDLE);
        }

        this.updateOverlayState();
    }

    openDepthDocument(chamberKey) {
        const doc = DOCUMENTS[chamberKey];
        if (!doc || !this.depthView) return;

        this.state = APP_STATES.DEPTH_OPEN;
        this.root?.setAttribute('data-state', APP_STATES.DEPTH_OPEN);
        this.activeDocumentKey = chamberKey;

        this.depthChamberEl.textContent = doc.chamber;
        this.depthTitleEl.textContent = doc.title;

        this.depthBodyEl.innerHTML = '';
        doc.paragraphs.forEach((paragraph) => {
            const p = document.createElement('p');
            p.textContent = paragraph;
            this.depthBodyEl.appendChild(p);
        });

        this.depthView.setAttribute('aria-hidden', 'false');
        this.depthSurface?.focus?.();

        this.updateOverlayState();
    }

    closeDepthView() {
        if (!this.depthView) return;

        this.depthView.setAttribute('aria-hidden', 'true');
        this.activeDocumentKey = null;

        if (this.state === APP_STATES.DEPTH_OPEN) {
            this.state = APP_STATES.CHAMBER_OPEN;
            this.root?.setAttribute('data-state', APP_STATES.CHAMBER_OPEN);
        }

        this.updateOverlayState();
    }

    updateOverlayState() {
        const isChamberOpen = this.chamberPanel?.getAttribute('aria-hidden') === 'false';
        const isDepthOpen = this.depthView?.getAttribute('aria-hidden') === 'false';
        const isOverlayOpen = isChamberOpen || isDepthOpen;

        if (this.header) {
            this.header.classList.toggle('header-layer--compact', isOverlayOpen);
        }

        if (this.viewport) {
            this.viewport.classList.toggle('viewport--dimmed', isOverlayOpen);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
    });

    // Initialize app
    window.ALCHEMY_APP = new AlchemyApp();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AlchemyApp, VoidExperience, CHAMBERS, DOCUMENTS };
}
