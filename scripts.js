/**
 * Alchemyin: House of Wisdom
 * 3D Procedural Temple Generator
 */

// Configuration
const CONFIG = {
    colors: {
        background: 0xF7F4EF,
        wireframe: 0x8A7F70, // Antique Bronze/Grey
        wireframeHighlight: 0xFFFAF0
    },
    camera: {
        fov: 45,
        near: 0.1,
        far: 100,
        posX: 0,
        posY: 1.5,
        posZ: 14
    },
    temple: {
        columnCount: 6,
        columnHeight: 4,
        columnRadius: 0.25,
        baseWidth: 7,
        baseHeight: 0.3,
        pedimentHeight: 1.8
    },
    animation: {
        rotSpeed: 0.0015,
        floatSpeed: 0.001,
        floatAmp: 0.15
    }
};

class TempleScene {
    constructor() {
        this.canvas = document.querySelector('#webgl-canvas');
        this.loader = document.querySelector('#loader');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.templeGroup = null;
        this.clock = new THREE.Clock();
        
        this.init();
        this.createTemple();
        this.render();
        this.handleResize();
        
        // Hide loader after a brief init period
        setTimeout(() => {
            this.loader.classList.add('hidden');
        }, 800);
    }

    init() {
        // Scene Setup
        this.scene = new THREE.Scene();
        // Fog blends the floor into the background seamlessly
        this.scene.fog = new THREE.FogExp2(CONFIG.colors.background, 0.06);

        // Camera Setup
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        this.camera.position.set(CONFIG.camera.posX, CONFIG.camera.posY, CONFIG.camera.posZ);
        this.camera.lookAt(0, 1, 0);

        // Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            alpha: true, 
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    /**
     * Procedurally builds the temple geometry
     */
    createTemple() {
        this.templeGroup = new THREE.Group();
        
        // Define Materials
        const wireMaterial = new THREE.LineBasicMaterial({
            color: CONFIG.colors.wireframe,
            transparent: true,
            opacity: 0.3,
            linewidth: 1
        });

        // 1. The Stylobate (Base)
        const baseGeo = new THREE.BoxGeometry(CONFIG.temple.baseWidth, CONFIG.temple.baseHeight, 3);
        const baseEdges = new THREE.EdgesGeometry(baseGeo);
        const base = new THREE.LineSegments(baseEdges, wireMaterial);
        base.position.y = -CONFIG.temple.columnHeight / 2;
        this.templeGroup.add(base);

        // 2. The Columns (Doric Style Order)
        const colGeo = new THREE.CylinderGeometry(
            CONFIG.temple.columnRadius * 0.85, // Top radius
            CONFIG.temple.columnRadius,        // Bottom radius
            CONFIG.temple.columnHeight, 
            16 // Radial segments
        );
        const colEdges = new THREE.EdgesGeometry(colGeo);

        // Calculate spacing
        const totalWidth = CONFIG.temple.baseWidth * 0.85;
        const spacing = totalWidth / (CONFIG.temple.columnCount - 1);
        const startX = -totalWidth / 2;

        for (let i = 0; i < CONFIG.temple.columnCount; i++) {
            const column = new THREE.LineSegments(colEdges, wireMaterial);
            column.position.x = startX + (i * spacing);
            column.position.y = 0; // Centered vertically
            // Add subtle random rotation to make it feel ancient/imperfect
            column.rotation.y = Math.random() * Math.PI; 
            this.templeGroup.add(column);
        }

        // 3. The Entablature & Pediment (Roof)
        // Main beam
        const beamGeo = new THREE.BoxGeometry(CONFIG.temple.baseWidth, 0.4, 3);
        const beamEdges = new THREE.EdgesGeometry(beamGeo);
        const beam = new THREE.LineSegments(beamEdges, wireMaterial);
        beam.position.y = CONFIG.temple.columnHeight / 2 + 0.2;
        this.templeGroup.add(beam);

        // Triangle Top (Pediment) - Using 4-sided cylinder (prism) logic
        const pedimentGeo = new THREE.CylinderGeometry(0, 4, CONFIG.temple.baseWidth, 4, 1);
        // We need to rotate and scale a cylinder to make it a roof prism
        const pedimentEdges = new THREE.EdgesGeometry(pedimentGeo);
        const pediment = new THREE.LineSegments(pedimentEdges, wireMaterial);
        
        // Rotate to align triangular face to front
        pediment.rotation.z = Math.PI / 2; 
        pediment.rotation.y = Math.PI / 4; 
        
        // Scale to flatten depth and match width
        pediment.scale.set(1, 0.4, 1); 
        pediment.position.y = CONFIG.temple.columnHeight / 2 + 1.2;
        
        this.templeGroup.add(pediment);

        // 4. Inner "Wisdom" Geometry (Floating Prism inside)
        const innerGeo = new THREE.IcosahedronGeometry(0.8, 0);
        const innerEdges = new THREE.EdgesGeometry(innerGeo);
        const innerMat = new THREE.LineBasicMaterial({ color: CONFIG.colors.wireframeHighlight, opacity: 0.6, transparent: true });
        this.innerCrystal = new THREE.LineSegments(innerEdges, innerMat);
        this.templeGroup.add(this.innerCrystal);

        this.scene.add(this.templeGroup);
    }

    render() {
        const time = this.clock.getElapsedTime();

        // 1. Rotate the entire temple slowly
        if(this.templeGroup) {
            this.templeGroup.rotation.y = Math.sin(time * 0.1) * 0.05 + (time * CONFIG.animation.rotSpeed);
            
            // 2. Float effect (Sine wave)
            this.templeGroup.position.y = Math.sin(time * 0.5) * CONFIG.animation.floatAmp;

            // 3. Inner crystal spins faster
            this.innerCrystal.rotation.x = time * 0.2;
            this.innerCrystal.rotation.z = time * 0.15;
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.render());
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TempleScene();
});
