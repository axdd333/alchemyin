/**
 * ALCHEMY · THE VOID STATE
 * 3D Context + Information Architecture
 */

const CONFIG = {
    colors: {
        bg: 0xEAE8E3,
        lines: 0x111111,
        fog: 0xEAE8E3
    },
    camera: {
        fov: 35,
        z: 14 // Pulled back slightly for scale
    },
    motion: {
        lerp: 0.03, // Heavier, more cinematic movement
        rotationSpeed: 0.0008
    }
};

class VoidExperience {
    constructor() {
        this.canvas = document.querySelector('#artifact-canvas');
        if (!this.canvas) return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Target rotation values for smooth interpolation
        this.targetRotX = 0;
        this.targetRotY = 0;

        this.init();
        this.createArtifact();
        this.addAtmosphere();
        this.events();
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

        // Soft lighting setup
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambient);

        const directional = new THREE.DirectionalLight(0xffffff, 0.5);
        directional.position.set(10, 10, 10);
        this.scene.add(directional);
    }

    createArtifact() {
        this.artifactGroup = new THREE.Group();

        // Materials
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

        // 1. The Monolith (Outer structure)
        const boxGeo = new THREE.BoxGeometry(2.2, 4.5, 2.2);
        this.monolith = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), wireMat);
        this.artifactGroup.add(this.monolith);

        // 2. The Arc (Celestial context)
        const arcGeo = new THREE.TorusGeometry(3.5, 0.02, 16, 100, Math.PI * 1.5);
        this.arc = new THREE.LineSegments(new THREE.EdgesGeometry(arcGeo), structureMat);
        this.arc.rotation.z = Math.PI / 4;
        this.artifactGroup.add(this.arc);

        // 3. The Core (Wisdom/Center)
        // Using an Icosahedron for more complexity than Octahedron
        const coreGeo = new THREE.IcosahedronGeometry(0.6, 0);
        this.core = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), structureMat);
        this.artifactGroup.add(this.core);

        // 4. The Grid (Grounding)
        const gridGeo = new THREE.PlaneGeometry(25, 25, 20, 20);
        const grid = new THREE.LineSegments(new THREE.EdgesGeometry(gridGeo), wireMat);
        grid.rotation.x = Math.PI / 2;
        grid.position.y = -3;
        this.artifactGroup.add(grid);

        this.scene.add(this.artifactGroup);
    }

    addAtmosphere() {
        const count = 300;
        const pos = new Float32Array(count * 3);
        
        // Create a cloud of points
        for (let i = 0; i < count * 3; i++) {
            pos[i] = (Math.random() - 0.5) * 20;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        
        const mat = new THREE.PointsMaterial({
            color: CONFIG.colors.lines,
            size: 0.03,
            transparent: true,
            opacity: 0.15
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    events() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width, this.height);
        });

        // Normalize mouse coordinates to -1 to 1
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / this.width) * 2 - 1;
            this.mouseY = -(e.clientY / this.height) * 2 + 1;
        });
    }

    render() {
        const time = Date.now() * CONFIG.motion.rotationSpeed;

        // Artifact Rotation
        if (this.artifactGroup) {
            this.artifactGroup.rotation.y = Math.sin(time * 0.5) * 0.2; // Gentle sway
        }

        // Core "Breathing" & Independent Rotation
        if (this.core) {
            this.core.rotation.x = time * 2;
            this.core.rotation.y = time;
            // Bobbing effect
            this.core.position.y = Math.sin(Date.now() * 0.002) * 0.15;
            // Breathing scale effect
            const scale = 1 + Math.sin(Date.now() * 0.0015) * 0.05;
            this.core.scale.set(scale, scale, scale);
        }

        // Arc Rotation
        if (this.arc) {
            this.arc.rotation.z += 0.001;
        }

        // Camera Inertia (Smooth mouse look)
        const targetX = this.mouseX * 0.8;
        const targetY = this.mouseY * 0.8;
        
        this.camera.position.x += (targetX - this.camera.position.x) * CONFIG.motion.lerp;
        this.camera.position.y += (targetY - this.camera.position.y) * CONFIG.motion.lerp;
        this.camera.lookAt(0, 0, 0);

        // Subtle particle rotation
        if (this.particles) {
            this.particles.rotation.y = time * 0.1;
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

/* --------- CHAMBER DATA & UI SYSTEM --------- */

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

function initChambers() {
    const panel = document.getElementById('chamber-panel');
    const labelEl = panel.querySelector('.chamber-label');
    const titleEl = panel.querySelector('.chamber-title');
    const bodyEl = panel.querySelector('.chamber-content');
    const closeBtn = panel.querySelector('.chamber-close');
    const links = document.querySelectorAll('.nav-link');

    function openChamber(key) {
        const data = CHAMBERS[key];
        if (!data) return;

        labelEl.textContent = data.label;
        titleEl.textContent = data.title;

        bodyEl.innerHTML = '';
        data.paragraphs.forEach(text => {
            const p = document.createElement('p');
            p.textContent = text;
            bodyEl.appendChild(p);
        });

        panel.classList.remove('chamber-panel--hidden');
        panel.classList.add('chamber-panel--visible');
        panel.setAttribute('aria-hidden', 'false');
    }

    function closeChamber() {
        panel.classList.remove('chamber-panel--visible');
        panel.classList.add('chamber-panel--hidden');
        panel.setAttribute('aria-hidden', 'true');
    }

    // Link Event Listeners
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const key = link.getAttribute('data-chamber');
            openChamber(key);
        });
    });

    // Closing Logic
    closeBtn.addEventListener('click', closeChamber);
    panel.addEventListener('click', (e) => {
        if (e.target === panel) closeChamber();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeChamber();
    });
}

/* Boot */
window.addEventListener('DOMContentLoaded', () => {
    new VoidExperience();
    initChambers();
});
