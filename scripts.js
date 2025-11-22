/**
 * ALCHEMYIN
 * House of Wisdom · Front End Controller
 */

/* --- CONFIGURATION & DATA --- */

const CONFIG = {
    colors: {
        bg: 0xEAE8E3,
        ink: 0x111111,
        wireframe: 0x333333
    },
    camera: {
        fov: 40,
        z: 14
    }
};

const CHAMBERS = {
    philosophy: {
        label: 'Chamber I · The Thesis',
        title: 'The Model Must Hold.',
        content: [
            'Every system inherits a worldview. Code is merely the enforcement mechanism of a philosophy. We begin not with capabilities, but with constraints.',
            'In an era of infinite leverage, the discipline of "No" becomes a survival strategy. We ask: who does this tool serve, what does it conserve, and what does it quietly destroy in the pursuit of efficiency?'
        ]
    },
    systems: {
        label: 'Chamber II · The Engine',
        title: 'Feedback & Governance.',
        content: [
            'This is the domain of protocols, feedback loops, and observability. The unglamorous architecture that determines longevity.',
            'We prefer designs that can be explained on a single sheet of paper. Complexity is not a sign of intelligence; it is often a sign of unresolved conflict. If the feedback loop is broken, the system is already dead.'
        ]
    },
    artifacts: {
        label: 'Chamber III · The Surface',
        title: 'Hard-World Tools.',
        content: [
            'Abstract logic must eventually condense into artifacts: interfaces, dashboards, field devices, and scripts. Surfaces that survive strange weather.',
            'See our research on <a class="doc-link" data-doc="providence">Providence Devices</a> for an example of disconnected resilience.'
        ]
    },
    oracle: {
        label: 'Chamber IV · The Forecast',
        title: 'Structured Doubt.',
        content: [
            'Where information becomes counsel. We use simulations and sensitivity analysis to map the terrain before walking it.',
            'The goal is not prediction theater, but better questions. We measure twice so we only have to cut once. See the <a class="doc-link" data-doc="favela">American Favela</a> thesis.'
        ]
    }
};

const DOCUMENTS = {
    favela: {
        kicker: 'Thesis 2024-A',
        title: 'The American Favela',
        subtitle: 'Urban improvisation in the collapse of municipal capacity.',
        sections: [
            {
                heading: 'The Retreat of Services',
                text: 'As municipal bonds fail and centralized infrastructure decays, we observe the emergence of localized, ad-hoc grids. The American Favela is not a slum, but a high-tech zone of improvisation. Starlink terminals wired to car batteries, mesh networks replacing ISPs, and private security replacing police.'
            },
            {
                heading: 'Architectural Implications',
                text: 'The home becomes a fortress. The aesthetics of the suburb—open lawns, glass facades—are replaced by the aesthetics of the compound. Permeability is a liability. We are designing for an era where the grid is an unreliable narrator.'
            },
            {
                heading: 'Tooling Requirements',
                text: 'In this environment, the most valuable tools are those that require zero external dependencies. Local LLMs, disconnected sensors, and kinetic energy harvesting. The cloud is a luxury; the edge is survival.'
            }
        ]
    },
    providence: {
        kicker: 'Artifact Spec 09',
        title: 'Providence Device Doctrine',
        subtitle: 'Hardware principles for the disconnect.',
        sections: [
            {
                heading: 'Principle of Silence',
                text: 'A Providence Device does not beacon. It listens. It emits no RF signature until explicitly queried via physical coupling or tight-beam directional burst. In an adversarial spectrum, silence is armor.'
            },
            {
                heading: 'Repairability Index',
                text: 'If it cannot be fixed with a standard multimeter and a soldering iron, it is not a tool, it is a lease. We reject sealed units. Every artifact produced by the House must be serviceable in the field by a Tier-1 technician.'
            }
        ]
    }
};

/* --- COMPONENT: VOID EXPERIENCE (3D) --- */

class VoidExperience {
    constructor() {
        this.canvas = document.querySelector('#artifact-canvas');
        if (!this.canvas) return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.mouseX = 0;
        this.mouseY = 0;

        this.init();
        this.createWorld();
        this.bindEvents();
        this.animate();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.bg);
        this.scene.fog = new THREE.FogExp2(CONFIG.colors.bg, 0.05);

        // Camera
        this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 0, CONFIG.camera.z);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Light
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambient);
        
        const spot = new THREE.DirectionalLight(0xffffff, 0.5);
        spot.position.set(10, 20, 10);
        this.scene.add(spot);
    }

    createWorld() {
        this.group = new THREE.Group();

        // Shared Materials
        const wireMat = new THREE.LineBasicMaterial({ color: CONFIG.colors.wireframe, transparent: true, opacity: 0.15 });
        const heavyMat = new THREE.LineBasicMaterial({ color: CONFIG.colors.ink, transparent: true, opacity: 0.8 });

        // 1. The Monolith (Cube)
        const boxGeo = new THREE.BoxGeometry(2.5, 4.5, 2.5);
        this.monolith = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), wireMat);
        this.group.add(this.monolith);

        // 2. The Arc (Torus)
        const arcGeo = new THREE.TorusGeometry(3.8, 0.02, 16, 100, Math.PI * 1.4);
        this.arc = new THREE.LineSegments(new THREE.EdgesGeometry(arcGeo), heavyMat);
        this.arc.rotation.z = Math.PI / 3;
        this.group.add(this.arc);

        // 3. The Core (Icosahedron)
        const coreGeo = new THREE.IcosahedronGeometry(0.5, 0);
        this.core = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), heavyMat);
        this.group.add(this.core);

        // 4. The Grid (Ground)
        const gridGeo = new THREE.PlaneGeometry(30, 30, 20, 20);
        const grid = new THREE.LineSegments(new THREE.EdgesGeometry(gridGeo), wireMat);
        grid.rotation.x = Math.PI / 2;
        grid.position.y = -3.5;
        this.group.add(grid);

        // 5. Particles
        const pCount = 300;
        const pPos = new Float32Array(pCount * 3);
        for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random() - 0.5) * 20;
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ color: CONFIG.colors.ink, size: 0.04, transparent: true, opacity: 0.2 });
        this.particles = new THREE.Points(pGeo, pMat);
        this.scene.add(this.particles);

        this.scene.add(this.group);
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

    animate() {
        const time = Date.now() * 0.001;

        // Subtle Group Rotation
        this.group.rotation.y = Math.sin(time * 0.2) * 0.1;

        // Core Breathing
        this.core.rotation.x = time;
        this.core.rotation.y = time * 0.5;
        this.core.position.y = Math.sin(time * 2) * 0.15;
        const scale = 1 + Math.sin(time * 1.5) * 0.05;
        this.core.scale.set(scale, scale, scale);

        // Arc drift
        this.arc.rotation.z = (Math.PI / 3) + Math.sin(time * 0.1) * 0.1;

        // Camera Inertia
        const targetX = this.mouseX * 0.5;
        const targetY = this.mouseY * 0.5;
        this.camera.position.x += (targetX - this.camera.position.x) * 0.03;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.03;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate.bind(this));
    }
}

/* --- COMPONENT: UI CONTROLLERS --- */

class ChamberPanel {
    constructor(app) {
        this.app = app;
        this.el = document.getElementById('chamber-panel');
        this.label = this.el.querySelector('.chamber-label');
        this.title = this.el.querySelector('.chamber-title');
        this.content = this.el.querySelector('.chamber-content');
        this.closeBtn = this.el.querySelector('.close-btn');

        this.bindEvents();
    }

    bindEvents() {
        this.closeBtn.addEventListener('click', () => this.app.clearState());
        this.el.addEventListener('click', (e) => {
            if(e.target === this.el) this.app.clearState();
        });

        // Delegate clicks for internal doc links
        this.content.addEventListener('click', (e) => {
            if (e.target.classList.contains('doc-link')) {
                e.preventDefault();
                const docId = e.target.getAttribute('data-doc');
                this.app.openDocument(docId);
            }
        });
    }

    open(key) {
        const data = CHAMBERS[key];
        if (!data) return;

        this.label.textContent = data.label;
        this.title.textContent = data.title;
        
        // Build paragraphs
        this.content.innerHTML = '';
        data.content.forEach(text => {
            const p = document.createElement('p');
            p.innerHTML = text; // Allow internal HTML like links
            this.content.appendChild(p);
        });

        this.el.classList.remove('chamber-panel--hidden');
        this.el.classList.add('chamber-panel--visible');
        this.el.setAttribute('aria-hidden', 'false');
    }

    close() {
        this.el.classList.remove('chamber-panel--visible');
        this.el.classList.add('chamber-panel--hidden');
        this.el.setAttribute('aria-hidden', 'true');
    }
}

class DepthView {
    constructor(app) {
        this.app = app;
        this.el = document.getElementById('depth-view');
        this.kicker = this.el.querySelector('.depth-kicker');
        this.title = this.el.querySelector('.depth-title');
        this.subtitle = this.el.querySelector('.depth-subtitle');
        this.body = this.el.querySelector('.depth-body');
        this.closeBtn = this.el.querySelector('.close-btn');
        this.scrollContainer = this.el.querySelector('.depth-scroll-container');

        this.bindEvents();
    }

    bindEvents() {
        this.closeBtn.addEventListener('click', () => this.app.clearState());
        this.el.addEventListener('click', (e) => {
            // Only close if clicking the "gutter" outside the card
            if(e.target === this.el || e.target === this.scrollContainer) this.app.clearState();
        });
    }

    open(key) {
        const data = DOCUMENTS[key];
        if (!data) return;

        this.kicker.textContent = data.kicker;
        this.title.textContent = data.title;
        this.subtitle.textContent = data.subtitle;

        this.body.innerHTML = '';
        data.sections.forEach(sec => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'depth-section';
            
            const h3 = document.createElement('h3');
            h3.textContent = sec.heading;
            sectionDiv.appendChild(h3);

            const p = document.createElement('p');
            p.textContent = sec.text;
            sectionDiv.appendChild(p);

            this.body.appendChild(sectionDiv);
        });

        // Reset scroll
        this.scrollContainer.scrollTop = 0;

        this.el.classList.remove('depth-view--hidden');
        this.el.classList.add('depth-view--visible');
        this.el.setAttribute('aria-hidden', 'false');
    }

    close() {
        this.el.classList.remove('depth-view--visible');
        this.el.classList.add('depth-view--hidden');
        this.el.setAttribute('aria-hidden', 'true');
    }
}

class NavController {
    constructor(app) {
        this.app = app;
        this.links = document.querySelectorAll('.nav-link');
        
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-target');
                this.app.openChamber(target);
            });
        });
    }

    updateActive(key) {
        this.links.forEach(link => {
            if (link.getAttribute('data-target') === key) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

/* --- MAIN APP ORCHESTRATOR --- */

class AlchemyApp {
    constructor() {
        // Init Subsystems
        this.void = new VoidExperience();
        this.chamberPanel = new ChamberPanel(this);
        this.depthView = new DepthView(this);
        this.nav = new NavController(this);

        this.setupGlobalEvents();
        this.handleInitialHash();
    }

    setupGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.clearState();
        });

        // Handle back/forward browser buttons
        window.addEventListener('hashchange', () => {
            this.parseHash();
        });
    }

    handleInitialHash() {
        if (window.location.hash) {
            this.parseHash();
        }
    }

    parseHash() {
        const hash = window.location.hash.substring(1); // Remove #
        if (!hash) {
            this.clearState(false);
            return;
        }

        if (CHAMBERS[hash]) {
            this.openChamber(hash, false);
        } else if (hash.startsWith('doc/')) {
            const docKey = hash.replace('doc/', '');
            if (DOCUMENTS[docKey]) {
                this.openDocument(docKey, false);
            }
        }
    }

    // Action: Open Chamber
    openChamber(key, updateHistory = true) {
        this.depthView.close(); // Ensure other view is closed
        this.chamberPanel.open(key);
        this.nav.updateActive(key);
        
        if (updateHistory) {
            history.pushState(null, '', `#${key}`);
        }
    }

    // Action: Open Document (Depth View)
    openDocument(key, updateHistory = true) {
        this.chamberPanel.close(); // Ensure other view is closed
        this.nav.updateActive(null); // Deselect nav
        this.depthView.open(key);

        if (updateHistory) {
            history.pushState(null, '', `#doc/${key}`);
        }
    }

    // Action: Clear All
    clearState(updateHistory = true) {
        this.chamberPanel.close();
        this.depthView.close();
        this.nav.updateActive(null);
        
        if (updateHistory) {
            history.pushState(null, '', ' '); // Clear hash
        }
    }
}

/* --- BOOT --- */

window.addEventListener('DOMContentLoaded', () => {
    new AlchemyApp();
});
