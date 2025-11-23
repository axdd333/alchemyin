// Configuration
const CONFIG = {
    colors: {
        void: 0xddd7cb,
        object: 0x1f1810,
        light: 0xffffff
    },
    camera: {
        fov: 32,
        z: 14
    },
    artifact: {
        scale: 0.72,
        rotation: 0.08,
        coreSpeed: 0.35,
        opacity: {
            faint: 0.12,
            medium: 0.22,
            strong: 0.32
        }
    }
};

// Void artifact
class VoidArtifact {
    constructor() {
        this.canvas = document.getElementById('artifact');
        if (!this.canvas || !window.THREE) return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.mouse = { x: 0, y: 0 };
        this.target = { x: 0, y: 0 };
        
        this.init();
        this.createArtifact();
        this.addAtmosphere();
        this.bindEvents();
        this.render();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.void);
        this.scene.fog = new THREE.FogExp2(CONFIG.colors.void, 0.055);

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

        const ambient = new THREE.AmbientLight(CONFIG.colors.light, 0.58);
        this.scene.add(ambient);

        const directional = new THREE.DirectionalLight(CONFIG.colors.light, 0.48);
        directional.position.set(6, 9, 5);
        this.scene.add(directional);
    }

    createArtifact() {
        this.artifact = new THREE.Group();

        const faintMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.object,
            transparent: true,
            opacity: CONFIG.artifact.opacity.faint
        });

        const strongMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.object,
            transparent: true,
            opacity: CONFIG.artifact.opacity.strong
        });

        // Monolith
        const mono = new THREE.BoxGeometry(1.9, 4.3, 1.6);
        const monoEdges = new THREE.EdgesGeometry(mono);
        this.monolith = new THREE.LineSegments(monoEdges, faintMat);
        this.monolith.position.y = -0.15;
        this.artifact.add(this.monolith);

        // Core
        const coreGeo = new THREE.OctahedronGeometry(0.62, 0);
        const coreEdges = new THREE.EdgesGeometry(coreGeo);
        this.core = new THREE.LineSegments(coreEdges, strongMat);
        this.core.position.set(0, 0.8, 0);
        this.artifact.add(this.core);

        // Arc
        const arcGeo = new THREE.TorusGeometry(3.1, 0.008, 4, 90, Math.PI * 1.42);
        const arcEdges = new THREE.EdgesGeometry(arcGeo);
        this.arc = new THREE.LineSegments(arcEdges, strongMat);
        this.arc.rotation.z = Math.PI / 2;
        this.arc.position.y = 1.3;
        this.artifact.add(this.arc);

        // Horizon
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

        this.artifact.scale.setScalar(CONFIG.artifact.scale);
        this.artifact.position.y = -0.18;

        this.scene.add(this.artifact);
    }

    addAtmosphere() {
        const count = 140;
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
            size: 0.016,
            transparent: true,
            opacity: 0.14
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
            this.target.x = (e.clientX / this.width) * 2 - 1;
            this.target.y = -(e.clientY / this.height) * 2 + 1;
        });
    }

    render() {
        const time = Date.now() * 0.0004;
        
        if (this.artifact) {
            this.artifact.rotation.y = time * CONFIG.artifact.rotation;
        }

        if (this.core) {
            this.core.rotation.x = time * CONFIG.artifact.coreSpeed;
            this.core.rotation.z = time * (CONFIG.artifact.coreSpeed * 0.62);
            
            const breathe = Math.sin(time * 1.4) * Math.sin(time * 0.7) * 0.06;
            this.core.position.y = 0.8 + breathe;
        }

        if (this.particles) {
            this.particles.rotation.y += 0.015;
        }

        this.mouse.x += (this.target.x * 0.28 - this.mouse.x) * 0.06;
        this.mouse.y += (this.target.y * 0.28 - this.mouse.y) * 0.06;

        this.camera.position.x = this.mouse.x;
        this.camera.position.y = this.mouse.y;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.render());
    }
}

// Chamber data
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

// Navigation
class ChamberNav {
    constructor() {
        this.labelEl = document.getElementById('label');
        this.titleEl = document.getElementById('title');
        this.bodyEl = document.getElementById('body');
        this.links = document.querySelectorAll('.nav-link');
        
        this.bind();
    }

    bind() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const chamber = link.dataset.chamber;
                this.navigate(chamber);
            });
        });
    }

    navigate(chamberKey) {
        const chamber = CHAMBERS[chamberKey];
        if (!chamber) return;

        this.labelEl.textContent = chamber.label;
        this.titleEl.textContent = chamber.title;
        
        this.bodyEl.innerHTML = '';
        chamber.paragraphs.forEach(text => {
            const p = document.createElement('p');
            p.textContent = text;
            this.bodyEl.appendChild(p);
        });

        this.links.forEach(link => {
            if (link.dataset.chamber === chamberKey) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    new VoidArtifact();
    new ChamberNav();
});
