/**
 * ALCHEMYIN: THE VOID STATE
 * "Perfection is achieved not when there is nothing more to add, 
 * but when there is nothing left to take away."
 */

const CONFIG = {
    color: {
        bg: 0xEAE8E3,
        object: 0x111111,
        light: 0xffffff
    },
    camera: {
        fov: 35, // Narrow FOV for cinematic look
        z: 12
    }
};

class VoidExperience {
    constructor() {
        this.canvas = document.querySelector('#artifact-canvas');
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
        this.scene.fog = new THREE.FogExp2(CONFIG.color.bg, 0.08); // Dense fog

        this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 0, CONFIG.camera.z);

        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true,
            alpha: false 
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lighting: Stark, studio-like
        const ambient = new THREE.AmbientLight(CONFIG.color.bg, 0.6);
        this.scene.add(ambient);

        const spot = new THREE.DirectionalLight(CONFIG.color.light, 0.8);
        spot.position.set(5, 10, 5);
        this.scene.add(spot);
    }

    createArtifact() {
        this.artifact = new THREE.Group();

        // Material: Thin, precise vector lines
        const lineMat = new THREE.LineBasicMaterial({
            color: CONFIG.color.object,
            transparent: true,
            opacity: 0.15, // Barely visible
            linewidth: 1
        });

        const heavyMat = new THREE.LineBasicMaterial({
            color: CONFIG.color.object,
            transparent: true,
            opacity: 0.8, // Stark contrast
            linewidth: 1
        });

        // 1. THE ARC (Celestial)
        // A large, incomplete circle representing the unfinished work
        const arcGeo = new THREE.TorusGeometry(3, 0.01, 3, 100, Math.PI * 1.5);
        this.arc = new THREE.LineSegments(new THREE.EdgesGeometry(arcGeo), heavyMat);
        this.arc.rotation.z = Math.PI / 4;
        this.artifact.add(this.arc);

        // 2. THE MONOLITH (Structure)
        // A wireframe cube intersected by the arc
        const boxGeo = new THREE.BoxGeometry(2, 4, 2);
        const boxEdges = new THREE.EdgesGeometry(boxGeo);
        this.monolith = new THREE.LineSegments(boxEdges, lineMat);
        this.artifact.add(this.monolith);

        // 3. THE CORE (Wisdom)
        // A dense inner geometry floating in the center
        const coreGeo = new THREE.OctahedronGeometry(0.5, 0);
        this.core = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), heavyMat);
        this.artifact.add(this.core);

        // 4. THE HORIZON (Context)
        // A single line representing the ground
        const gridGeo = new THREE.PlaneGeometry(20, 20, 20, 20);
        const gridEdges = new THREE.EdgesGeometry(gridGeo);
        this.grid = new THREE.LineSegments(gridEdges, lineMat);
        this.grid.rotation.x = Math.PI / 2;
        this.grid.position.y = -2.5;
        this.artifact.add(this.grid);

        this.scene.add(this.artifact);
    }

    addAtmosphere() {
        // Particles: The dust of the void
        const count = 200;
        const pos = new Float32Array(count * 3);
        for(let i=0; i<count*3; i++) {
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
            // Normalized coordinates -1 to 1
            this.mouseX = (e.clientX / this.width) * 2 - 1;
            this.mouseY = -(e.clientY / this.height) * 2 + 1;
        });
    }

    render() {
        const time = Date.now() * 0.0005;

        // 1. Slow, hypnotic rotation of the artifact
        if (this.artifact) {
            this.artifact.rotation.y = time * 0.1; 
        }

        // 2. The Core pulses and spins independently
        if (this.core) {
            this.core.rotation.x = time;
            this.core.rotation.z = time * 0.5;
            this.core.position.y = Math.sin(time * 2) * 0.1;
        }

        // 3. Parallax: The camera floats slightly based on mouse
        // "Nihilistic" interaction is detached—the world moves, you don't.
        this.camera.position.x += (this.mouseX * 0.5 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouseY * 0.5 - this.camera.position.y) * 0.05;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

// Enter The Void
window.addEventListener('DOMContentLoaded', () => new VoidExperience());
