/**
 * Alchemyin: House of Wisdom
 * Immersive Digital Temple v2.0
 */

const CONFIG = {
    colors: {
        bg: 0xF2EFE9,
        lines: 0x2A2A2A, // Dark Charcoal for high contrast
        floor: 0x8A8A8A,
        accent: 0xBFA88F  // Antique Gold
    },
    camera: {
        fov: 50,
        startPos: { x: 0, y: 1, z: 25 }, // Start far away
        endPos: { x: 0, y: 1.5, z: 14 }  // End position (The "Step Inside" effect)
    }
};

class ImmersiveWorld {
    constructor() {
        this.canvas = document.querySelector('#webgl-canvas');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Mouse state for parallax
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;

        this.init();
        this.createEnvironment();
        this.createTemple();
        this.addParticles(); // Atmospheric dust
        this.setupEvents();
        
        // Reveal animation
        setTimeout(() => {
            document.querySelector('#loader').classList.add('loaded');
            this.animateIntro();
        }, 500);

        this.render();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.bg);
        // Fog gives depth - objects fade into the limestone distance
        this.scene.fog = new THREE.FogExp2(CONFIG.colors.bg, 0.045);

        this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, this.width / this.height, 0.1, 100);
        this.camera.position.set(CONFIG.camera.startPos.x, CONFIG.camera.startPos.y, CONFIG.camera.startPos.z);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    createEnvironment() {
        // Infinite Floor Grid fading into fog
        const gridHelper = new THREE.GridHelper(60, 60, CONFIG.colors.floor, CONFIG.colors.bg);
        gridHelper.position.y = -2;
        gridHelper.material.opacity = 0.15;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
    }

    createTemple() {
        this.templeGroup = new THREE.Group();

        // Material: Thin, precise charcoal lines
        const lineMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.lines,
            transparent: true,
            opacity: 0.25,
            linewidth: 1
        });
        
        // Material: Subtle glowing accent for the "Wisdom" object
        const accentMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.accent,
            transparent: true,
            opacity: 0.6
        });

        // 1. Columns (Neoclassical)
        const colGeo = new THREE.CylinderGeometry(0.3, 0.35, 5, 8, 1, true);
        const colEdges = new THREE.EdgesGeometry(colGeo);
        
        const colCount = 6;
        const spacing = 1.2;
        const totalW = (colCount - 1) * spacing;
        
        for(let i = 0; i < colCount; i++) {
            const col = new THREE.LineSegments(colEdges, lineMat);
            col.position.set(-totalW/2 + i*spacing, 0.5, 0);
            // Slight random rotation for "ancient" imperfection
            col.rotation.y = Math.random() * 0.5;
            this.templeGroup.add(col);
        }

        // 2. Architrave (Top Beam)
        const beamGeo = new THREE.BoxGeometry(totalW + 1, 0.6, 1);
        const beam = new THREE.LineSegments(new THREE.EdgesGeometry(beamGeo), lineMat);
        beam.position.y = 3.3;
        this.templeGroup.add(beam);

        // 3. Floating "Wisdom" Geometric Core (The Avant-Garde Element)
        // A dual-rotating Icosahedron floating in the center
        const coreGeo = new THREE.IcosahedronGeometry(0.8, 0);
        this.core = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), accentMat);
        this.core.position.set(0, 1.5, 0);
        this.templeGroup.add(this.core);

        // 4. Outer Ring (The "Orbit")
        const ringGeo = new THREE.TorusGeometry(2.5, 0.02, 3, 64);
        this.ring = new THREE.LineSegments(new THREE.EdgesGeometry(ringGeo), lineMat);
        this.ring.rotation.x = Math.PI / 2;
        this.ring.position.y = 1.5;
        this.templeGroup.add(this.ring);

        this.scene.add(this.templeGroup);
    }

    addParticles() {
        // Floating dust motes to show air/volume
        const particleCount = 100;
        const geo = new THREE.BufferGeometry();
        const positions = [];

        for(let i=0; i<particleCount; i++) {
            positions.push((Math.random() - 0.5) * 20); // x
            positions.push((Math.random() - 0.5) * 10); // y
            positions.push((Math.random() - 0.5) * 20); // z
        }

        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: CONFIG.colors.lines,
            size: 0.03,
            transparent: true,
            opacity: 0.2
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    animateIntro() {
        // "Dolly In" effect - simulated smooth camera move
        const start = { z: CONFIG.camera.startPos.z };
        const end = { z: CONFIG.camera.endPos.z };
        
        // Simple easing function
        let progress = 0;
        const duration = 2500; // ms
        const startTime = Date.now();

        const dolly = () => {
            const now = Date.now();
            progress = Math.min((now - startTime) / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.z = start.z + (end.z - start.z) * ease;

            if(progress < 1) requestAnimationFrame(dolly);
        };
        dolly();
    }

    setupEvents() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width, this.height);
        });

        // Mouse Parallax Interaction
        document.addEventListener('mousemove', (e) => {
            // Normalize mouse position -1 to 1
            this.mouseX = (e.clientX / this.width) * 2 - 1;
            this.mouseY = -(e.clientY / this.height) * 2 + 1;
        });
    }

    render() {
        const time = Date.now() * 0.001;

        // 1. Temple Idle Animation (Breathing)
        if(this.templeGroup) {
            this.templeGroup.position.y = Math.sin(time * 0.5) * 0.1; // Float
        }
        
        // 2. Core Animation (Wisdom spinning)
        if(this.core) {
            this.core.rotation.x = time * 0.2;
            this.core.rotation.y = time * 0.3;
        }

        // 3. Ring Animation (Slow orbit)
        if(this.ring) {
            this.ring.rotation.z = time * 0.05;
            this.ring.rotation.x = (Math.PI / 2) + Math.sin(time * 0.2) * 0.1;
        }

        // 4. Parallax - Smoothly interpolate camera position based on mouse
        // This makes the world feel like it exists around the cursor
        this.targetRotationX += (this.mouseX * 0.5 - this.targetRotationX) * 0.05;
        this.targetRotationY += (this.mouseY * 0.2 - this.targetRotationY) * 0.05;

        this.camera.position.x += (this.mouseX * 1.5 - this.camera.position.x) * 0.03;
        this.camera.position.y = CONFIG.camera.endPos.y + (this.mouseY * 0.5);
        this.camera.lookAt(0, 1, 0);

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.render());
    }
}

// Init
window.addEventListener('DOMContentLoaded', () => new ImmersiveWorld());
