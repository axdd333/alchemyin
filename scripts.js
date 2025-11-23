/**
 * ALCHEMY · CORE SYSTEM
 * Precision void environment with restrained artifact
 */

const CONFIG = {
    colors: {
        void: 0xddd7cb,      // Matching CSS --void
        object: 0x1f1810,    // Matching CSS --ink
        light: 0xffffff
    },
    camera: {
        fov: 32,
        near: 0.1,
        far: 100,
        z: 14
    },
    artifact: {
        scale: 0.72,
        rotation: 0.08,       // Very slow
        coreSpeed: 0.35,
        opacity: {
            faint: 0.12,
            medium: 0.22,
            strong: 0.32
        }
    },
    atmosphere: {
        particleCount: 140,
        particleSize: 0.016,
        particleOpacity: 0.14,
        driftSpeed: 0.015
    },
    motion: {
        mouseInfluence: 0.28,
        lerp: 0.06
    }
};

class VoidArtifact {
    constructor() {
        this.canvas = document.getElementById('artifact');
        if (!this.canvas || typeof THREE === 'undefined') {
            console.warn('Three.js or canvas not available');
            return;
        }

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.mouse = { x: 0, y: 0 };
        this.target = { x: 0, y: 0 };
        
        this.clock = new THREE.Clock();
        
        this.init();
        this.createArtifact();
        this.addAtmosphere();
        this.bindEvents();
        this.render();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.void);
        this.scene.fog = new THREE.FogExp2(CONFIG.colors.void, 0.055);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            this.width / this.height,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        this.camera.position.set(0, 0, CONFIG.camera.z);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // Lighting
        const ambient = new THREE.AmbientLight(CONFIG.colors.light, 0.58);
        this.scene.add(ambient);

        const directional = new THREE.DirectionalLight(CONFIG.colors.light, 0.48);
        directional.position.set(6, 9, 5);
        this.scene.add(directional);
    }

    createArtifact() {
        this.artifact = new THREE.Group();

        // Materials - extremely restrained
        const faintMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.object,
            transparent: true,
            opacity: CONFIG.artifact.opacity.faint,
            linewidth: 1
        });

        const mediumMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.object,
            transparent: true,
            opacity: CONFIG.artifact.opacity.medium,
            linewidth: 1
        });

        const strongMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.object,
            transparent: true,
            opacity: CONFIG.artifact.opacity.strong,
            linewidth: 1
        });

        // MONOLITH - vertical presence
        const mono = new THREE.BoxGeometry(1.9, 4.3, 1.6);
        const monoEdges = new THREE.EdgesGeometry(mono);
        this.monolith = new THREE.LineSegments(monoEdges, faintMat);
        this.monolith.position.y = -0.15;
        this.artifact.add(this.monolith);

        // CORE - intelligence node
        const coreGeo = new THREE.OctahedronGeometry(0.62, 0);
        const coreEdges = new THREE.EdgesGeometry(coreGeo);
        this.core = new THREE.LineSegments(coreEdges, strongMat);
        this.core.position.set(0, 0.8, 0);
        this.artifact.add(this.core);

        // ARC - celestial curve (very subtle)
        const arcGeo = new THREE.TorusGeometry(3.1, 0.008, 4, 90, Math.PI * 1.42);
        const arcEdges = new THREE.EdgesGeometry(arcGeo);
        this.arc = new THREE.LineSegments(arcEdges, mediumMat);
        this.arc.rotation.z = Math.PI / 2;
        this.arc.position.y = 1.3;
        this.artifact.add(this.arc);

        // HORIZON - extremely faint reference grid
        const horizon = new THREE.PlaneGeometry(18, 18, 12, 12);
        const horizonEdges = new THREE.EdgesGeometry(horizon);
        this.grid = new THREE.LineSegments(
            horizonEdges,
            new THREE.LineBasicMaterial({
                color: CONFIG.colors.object,
                transparent: true,
                opacity: 0.06
            })
        );
        this.grid.rotation.x = Math.PI / 2;
        this.grid.position.y = -2.6;
        this.artifact.add(this.grid);

        // Scale and position
        this.artifact.scale.setScalar(CONFIG.artifact.scale);
        this.artifact.position.y = -0.18;

        this.scene.add(this.artifact);
    }

    addAtmosphere() {
        const count = CONFIG.atmosphere.particleCount;
        const positions = new Float32Array(count * 3);
        
        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20;
            positions[i + 1] = (Math.random() - 0.5) * 20;
            positions[i + 2] = (Math.random() - 0.5) * 20;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: CONFIG.colors.object,
            size: CONFIG.atmosphere.particleSize,
            transparent: true,
            opacity: CONFIG.atmosphere.particleOpacity,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    bindEvents() {
        // Resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.width = window.innerWidth;
                this.height = window.innerHeight;
                this.camera.aspect = this.width / this.height;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(this.width, this.height);
            }, 100);
        }, { passive: true });

        // Mouse
        let mouseMoveRAF;
        document.addEventListener('mousemove', (e) => {
            if (mouseMoveRAF) return;
            
            mouseMoveRAF = requestAnimationFrame(() => {
                this.target.x = (e.clientX / this.width) * 2 - 1;
                this.target.y = -(e.clientY / this.height) * 2 + 1;
                mouseMoveRAF = null;
            });
        }, { passive: true });
    }

    render() {
        const time = this.clock.getElapsedTime();
        
        // Artifact - extremely slow, deliberate rotation
        if (this.artifact) {
            this.artifact.rotation.y = time * CONFIG.artifact.rotation;
        }

        // Core - precise, meditative spin
        if (this.core) {
            this.core.rotation.x = time * CONFIG.artifact.coreSpeed;
            this.core.rotation.z = time * (CONFIG.artifact.coreSpeed * 0.62);
            
            // Subtle breathing
            const breathe = Math.sin(time * 1.4) * Math.sin(time * 0.7) * 0.06;
            this.core.position.y = 0.8 + breathe;
            
            const scale = 1 + Math.sin(time * 1.4) * 0.018;
            this.core.scale.setScalar(scale);
        }

        // Particles - slow drift
        if (this.particles) {
            this.particles.rotation.y += CONFIG.atmosphere.driftSpeed;
        }

        // Camera parallax - extremely subtle
        this.mouse.x += (this.target.x * CONFIG.motion.mouseInfluence - this.mouse.x) * CONFIG.motion.lerp;
        this.mouse.y += (this.target.y * CONFIG.motion.mouseInfluence - this.mouse.y) * CONFIG.motion.lerp;

        this.camera.position.x = this.mouse.x;
        this.camera.position.y = this.mouse.y;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

/**
 * CHAMBER NAVIGATION
 */

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

class ChamberSystem {
    constructor() {
        this.labelEl = document.getElementById('card-label');
        this.titleEl = document.getElementById('card-title');
        this.bodyEl = document.getElementById('card-body');
        this.links = Array.from(document.querySelectorAll('.nav__link'));
        
        if (!this.labelEl || !this.titleEl || !this.bodyEl) return;
        
        this.currentChamber = 'philosophy';
        this.bind();
    }

    bind() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const chamber = link.dataset.chamber;
                if (chamber && chamber !== this.currentChamber) {
                    this.navigate(chamber);
                }
            });
        });
    }

    navigate(chamberKey) {
        const chamber = CHAMBERS[chamberKey];
        if (!chamber) return;

        this.currentChamber = chamberKey;

        // Update content
        this.labelEl.textContent = chamber.label;
        this.titleEl.textContent = chamber.title;
        
        this.bodyEl.innerHTML = '';
        chamber.paragraphs.forEach(text => {
            const p = document.createElement('p');
            p.textContent = text;
            this.bodyEl.appendChild(p);
        });

        // Update nav state
        this.links.forEach(link => {
            if (link.dataset.chamber === chamberKey) {
                link.classList.add('nav__link--active');
            } else {
                link.classList.remove('nav__link--active');
            }
        });
    }
}

/**
 * INITIALIZE
 */

window.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.remove('no-js');
    new VoidArtifact();
    new ChamberSystem();
});
