/**
 * ALCHEMYIN: THE VOID STATE
 * Base artifact + chamber overlay system
 */

const CONFIG = {
    color: {
        bg: 0xEAE8E3,
        object: 0x111111,
        light: 0xffffff
    },
    camera: {
        fov: 35,
        z: 12
    }
};

class VoidExperience {
    constructor() {
        this.canvas = document.querySelector('#artifact-canvas');
        if (!this.canvas || typeof THREE === 'undefined') return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.mouseX = 0;
        this.mouseY = 0;

        this.init();
        this.createArtifact();
        this.addAtmosphere();
        this.events();
        this.render();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.color.bg);
        this.scene.fog = new THREE.FogExp2(CONFIG.color.bg, 0.08);

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

        const spot = new THREE.DirectionalLight(CONFIG.color.light, 0.8);
        spot.position.set(5, 10, 5);
        this.scene.add(spot);
    }

    createArtifact() {
        this.artifact = new THREE.Group();

        const lineMat = new THREE.LineBasicMaterial({
            color: CONFIG.color.object,
            transparent: true,
            opacity: 0.15,
            linewidth: 1
        });

        const heavyMat = new THREE.LineBasicMaterial({
            color: CONFIG.color.object,
            transparent: true,
            opacity: 0.8,
            linewidth: 1
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

        // CORE (Wisdom)
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
        const count = 200;
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            pos[i] = (Math.random() - 0.5) * 15;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color: 0x000000,
            size: 0.02,
            transparent: true,
            opacity: 0.2
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

        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / this.width) * 2 - 1;
            this.mouseY = -(e.clientY / this.height) * 2 + 1;
        });
    }

    render() {
        const time = Date.now() * 0.0005;

        if (this.artifact) {
            this.artifact.rotation.y = time * 0.1;
        }

        if (this.core) {
            this.core.rotation.x = time;
            this.core.rotation.z = time * 0.5;
            this.core.position.y = Math.sin(time * 2) * 0.1;
        }

        this.camera.position.x += (this.mouseX * 0.5 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouseY * 0.5 - this.camera.position.y) * 0.05;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

/* --------- CHAMBER SYSTEM (UI) --------- */

const CHAMBERS = {
    philosophy: {
        label: 'Chamber I · Philosophy',
        title: 'What a system believes about the world.',
        paragraphs: [
            'Every system inherits a worldview, whether it admits it or not. This is where we make that explicit.',
            'We work with questions of value, time, responsibility, and power: who the tool serves, what it conserves, and what it quietly destroys.'
        ]
    },
    systems: {
        label: 'Chamber II · Systems',
        title: 'The architecture that carries the weight.',
        paragraphs: [
            'Interfaces, protocols, automation, feedback loops, observability. The boring parts that decide whether something lasts.',
            'We prefer designs that can be explained on a single sheet of paper and maintained without heroics.'
        ]
    },
    artifacts: {
        label: 'Chamber III · Artifacts',
        title: 'Surfaces that survive strange weather.',
        paragraphs: [
            'Eventually everything condenses into artifacts: tools, dashboards, small devices, documents, scripts.',
            'The work here is execution with disproportionate care: ergonomics, legibility, and the quiet discipline of not adding noise.'
        ]
    },
    oracle: {
        label: 'Chamber IV · Oracle',
        title: 'Structured doubt for irreversible decisions.',
        paragraphs: [
            'This is the layer where information becomes counsel: simulations, scenario maps, and sensitivity analysis.',
            'The goal is not prediction theater, but better questions before committing to moves that are expensive to reverse.'
        ]
    }
};

function initChambers() {
    const panel = document.getElementById('chamber-panel');
    if (!panel) return;

    const labelEl = panel.querySelector('.chamber-label');
    const titleEl = panel.querySelector('.chamber-title');
    const bodyEl = panel.querySelector('.chamber-body');
    const closeBtn = panel.querySelector('.chamber-close');

    const links = document.querySelectorAll('.nav-links .link');

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
        document.body.classList.add('chamber-open');
        panel.setAttribute('aria-hidden', 'false');
    }

    function closeChamber() {
        panel.classList.remove('chamber-panel--visible');
        panel.classList.add('chamber-panel--hidden');
        document.body.classList.remove('chamber-open');
        panel.setAttribute('aria-hidden', 'true');
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const key = link.getAttribute('data-chamber');
            openChamber(key);
        });
    });

    closeBtn.addEventListener('click', closeChamber);

    // Close on background click
    panel.addEventListener('click', (e) => {
        if (e.target === panel) closeChamber();
    });

    // ESC key closes panel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeChamber();
    });
}

/* Boot everything */

window.addEventListener('DOMContentLoaded', () => {
    new VoidExperience();
    initChambers();
});
