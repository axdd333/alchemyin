/**
 * ALCHEMYIN CORE OS v2.0
 * Precision-refined void environment with enhanced orchestration
 */

// Feature detection and progressive enhancement
const SUPPORTS = {
    cssVariables: typeof CSS !== 'undefined' && CSS.supports && CSS.supports('color', 'var(--test)'),
    importMaps: 'importMap' in document.createElement('script'),
    backdropFilter: typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'blur(1px)')
};

// Enhanced configuration with precision timing
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
        parallax: 0.3,
        lerp: 0.08,
        artifactSpin: 0.04,
        coreSpinX: 0.4,
        coreSpinZ: 0.2,
        coreBobAmp: 0.08,
        coreBobFreq: 1.8,
        particleDrift: 0.02
    },
    timing: {
        panelEnter: 500,
        panelExit: 400,
        stateTransition: 300
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
        if (!this.canvas) {
            console.warn('Canvas element not found');
            return;
        }

        if (typeof THREE === 'undefined') {
            console.error('THREE.js is required but not loaded');
            return;
        }

        this.updateDimensions();
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        // Enhanced timing with delta
        this.clock = new THREE.Clock();
        this.frameCount = 0;
        
        // Performance monitoring
        this.fps = 60;
        this.lastFrameTime = performance.now();

        this.init();
        this.createArtifact();
        this.addAtmosphere();
        this.bindEvents();
        this.startRendering();
    }

    updateDimensions() {
        if (!this.canvas) return;

        const { width, height } = this.canvas.getBoundingClientRect();
        this.width = width || window.innerWidth;
        this.height = height || window.innerHeight;

        if (this.renderer) {
            this.renderer.setSize(this.width, this.height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

        if (this.camera) {
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
        }
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = null;
        
        // Enhanced fog with distance-based falloff
        this.scene.fog = new THREE.FogExp2(CONFIG.colors.bg, 0.06);

        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            this.width / this.height,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        this.camera.position.set(0, 0, CONFIG.camera.z);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        this.updateDimensions();

        // Enhanced lighting system
        const ambient = new THREE.AmbientLight(CONFIG.colors.light, 0.65);
        this.scene.add(ambient);

        const directional = new THREE.DirectionalLight(CONFIG.colors.light, 0.5);
        directional.position.set(5, 8, 5);
        directional.castShadow = false;
        this.scene.add(directional);

        // Subtle fill light
        const fill = new THREE.DirectionalLight(CONFIG.colors.light, 0.25);
        fill.position.set(-3, 2, -3);
        this.scene.add(fill);
    }

    createArtifact() {
        this.artifact = new THREE.Group();

        // Enhanced material system
        const lineMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.object,
            transparent: true,
            opacity: 0.14,
            linewidth: 1
        });

        const heavyMat = new THREE.LineBasicMaterial({
            color: CONFIG.colors.object,
            transparent: true,
            opacity: 0.78,
            linewidth: 1.5
        });

        // ARC - Refined geometry
        const arcGeo = new THREE.TorusGeometry(3.2, 0.008, 4, 120, Math.PI * 1.48);
        this.arc = new THREE.LineSegments(new THREE.EdgesGeometry(arcGeo), heavyMat);
        this.arc.rotation.z = Math.PI / 3.8;
        this.artifact.add(this.arc);

        // MONOLITH - Enhanced proportions
        const boxGeo = new THREE.BoxGeometry(1.8, 4.2, 1.8);
        const boxEdges = new THREE.EdgesGeometry(boxGeo);
        this.monolith = new THREE.LineSegments(boxEdges, lineMat);
        this.monolith.rotation.y = Math.PI / 8;
        this.artifact.add(this.monolith);

        // CORE - Refined breathing motion
        const coreGeo = new THREE.OctahedronGeometry(0.42, 1);
        this.core = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), heavyMat);
        this.core.scale.setScalar(1.1);
        this.artifact.add(this.core);

        // HORIZON - Subtle grid reference
        const gridGeo = new THREE.PlaneGeometry(22, 22, 18, 18);
        const gridEdges = new THREE.EdgesGeometry(gridGeo);
        this.grid = new THREE.LineSegments(gridEdges, lineMat);
        this.grid.rotation.x = -Math.PI / 2;
        this.grid.position.y = -2.8;
        this.artifact.add(this.grid);

        this.scene.add(this.artifact);
    }

    addAtmosphere() {
        // Enhanced particle system with depth variation
        const count = 180;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 25;
            positions[i + 1] = (Math.random() - 0.5) * 25;
            positions[i + 2] = (Math.random() - 0.5) * 25;
            
            // Size variation based on depth
            sizes[i / 3] = Math.random() * 0.03 + 0.01;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.PointsMaterial({
            color: CONFIG.colors.object,
            size: 0.02,
            transparent: true,
            opacity: 0.18,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    bindEvents() {
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateDimensions();
            }, 100);
        };

        window.addEventListener('resize', handleResize, { passive: true });

        // Enhanced mouse tracking with smoothing
        let rafId;
        const handleMouseMove = (e) => {
            if (rafId) return;
            
            rafId = requestAnimationFrame(() => {
                this.targetX = (e.clientX / this.width) * 2 - 1;
                this.targetY = -(e.clientY / this.height) * 2 + 1;
                rafId = null;
            });
        };

        document.addEventListener('mousemove', handleMouseMove, { passive: true });

        // Touch support for mobile
        const handleTouchMove = (e) => {
            if (e.touches.length > 0) {
                this.targetX = (e.touches[0].clientX / this.width) * 2 - 1;
                this.targetY = -(e.touches[0].clientY / this.height) * 2 + 1;
            }
        };

        document.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    startRendering() {
        const animate = (currentTime) => {
            this.rafId = requestAnimationFrame(animate);
            this.render(currentTime);
        };
        
        this.rafId = requestAnimationFrame(animate);
    }

    render(currentTime) {
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        
        // Update FPS calculation
        this.frameCount++;
        if (currentTime - this.lastFrameTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = currentTime;
        }

        // Artifact rotation with delta timing
        if (this.artifact) {
            this.artifact.rotation.y += delta * CONFIG.motion.artifactSpin;
        }

        // Core breathing animation
        if (this.core) {
            this.core.rotation.x += delta * CONFIG.motion.coreSpinX;
            this.core.rotation.z += delta * CONFIG.motion.coreSpinZ;
            
            // Smoother bobbing motion
            const bobOffset = Math.sin(time * CONFIG.motion.coreBobFreq) * 
                            Math.sin(time * CONFIG.motion.coreBobFreq * 0.5) * 
                            CONFIG.motion.coreBobAmp;
            this.core.position.y = bobOffset;
            
            // Subtle scale breathing
            const scale = 1 + Math.sin(time * CONFIG.motion.coreBobFreq * 1.2) * 0.02;
            this.core.scale.setScalar(scale);
        }

        // Particle drift
        if (this.particles) {
            this.particles.rotation.y += delta * CONFIG.motion.particleDrift;
        }

        // Smoother camera parallax
        this.mouseX += (this.targetX * CONFIG.motion.parallax - this.mouseX) * CONFIG.motion.lerp;
        this.mouseY += (this.targetY * CONFIG.motion.parallax - this.mouseY) * CONFIG.motion.lerp;

        this.camera.position.x = this.mouseX;
        this.camera.position.y = this.mouseY;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        // Clean up Three.js resources
        [this.scene, this.renderer].forEach(item => {
            if (item && typeof item.dispose === 'function') {
                item.dispose();
            }
        });
    }
}

/**
 * Enhanced state machine for application orchestration
 */
class AppStateMachine {
    constructor() {
        this.state = APP_STATES.LOADING;
        this.previousState = null;
        this.listeners = new Map();
    }

    transitionTo(newState, data = {}) {
        if (this.state === newState) return;

        this.previousState = this.state;
        this.state = newState;

        // Notify listeners
        this.listeners.forEach((callback, key) => {
            try {
                callback(this.state, this.previousState, data);
            } catch (error) {
                console.warn(`State listener error (${key}):`, error);
            }
        });

        // Dispatch global event
        window.dispatchEvent(new CustomEvent('appStateChange', {
            detail: { state: this.state, previous: this.previousState, data }
        }));
    }

    addListener(key, callback) {
        this.listeners.set(key, callback);
    }

    removeListener(key) {
        this.listeners.delete(key);
    }
}

/**
 * Enhanced navigation controller with focus management
 */
class NavController {
    constructor({ linkSelector }) {
        this.links = Array.from(document.querySelectorAll(linkSelector));
        this.activeLink = null;
        this.bind();
    }

    bind() {
        this.links.forEach(link => {
            // Enhanced click handling with debouncing
            let clickTimeout;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (clickTimeout) return;
                
                clickTimeout = setTimeout(() => {
                    const route = link.dataset.route || link.getAttribute('href').replace('#', '');
                    if (route) {
                        this.navigateTo(route);
                    }
                    clickTimeout = null;
                }, 150);
            });

            // Keyboard navigation support
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });

        // Keyboard navigation between links
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.activeLink) {
                this.handleTabNavigation(e);
            }
        });
    }

    navigateTo(route) {
        // Use History API for cleaner URLs
        if (window.location.hash !== `#${route}`) {
            window.history.pushState({ route }, '', `#${route}`);
            window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
    }

    setActiveByChamber(key) {
        this.clearActive();
        
        const activeLink = this.links.find(link => 
            link.getAttribute('data-chamber') === key
        );
        
        if (activeLink) {
            activeLink.classList.add('link--active');
            this.activeLink = activeLink;
        }
    }

    clearActive() {
        this.links.forEach(link => link.classList.remove('link--active'));
        this.activeLink = null;
    }

    handleTabNavigation(e) {
        const currentIndex = this.links.indexOf(this.activeLink);
        let nextIndex;

        if (e.shiftKey) {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : this.links.length - 1;
        } else {
            nextIndex = currentIndex < this.links.length - 1 ? currentIndex + 1 : 0;
        }

        this.links[nextIndex].focus();
        e.preventDefault();
    }
}

/**
 * Enhanced ChamberPanel with improved accessibility
 */
class ChamberPanel {
    constructor({ panelSelector, data, onRequestClose }) {
        this.root = document.querySelector(panelSelector);
        if (!this.root) {
            console.warn(`Chamber panel not found: ${panelSelector}`);
            return;
        }

        this.data = data || {};
        this.onRequestClose = onRequestClose;
        this.currentKey = null;
        this.isVisible = false;

        // Cache elements
        this.elements = {
            label: this.root.querySelector('.chamber-label'),
            title: this.root.querySelector('.chamber-title'),
            body: this.root.querySelector('.chamber-body'),
            close: this.root.querySelector('.chamber-close'),
            scrim: this.root.querySelector('.chamber-panel__scrim')
        };

        this.bind();
        this.initAccessibility();
    }

    initAccessibility() {
        this.root.setAttribute('aria-hidden', 'true');
        this.root.setAttribute('aria-labelledby', 'chamber-title');
        this.root.setAttribute('aria-describedby', 'chamber-body');
    }

    bind() {
        // Enhanced close handlers
        const closeHandlers = [
            this.elements.close,
            this.elements.scrim
        ].filter(Boolean);

        closeHandlers.forEach(element => {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                this.requestClose();
            });
        });

        // Keyboard navigation
        this.root.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.requestClose();
            }
            
            if (e.key === 'Tab') {
                this.trapFocus(e);
            }
        });
    }

    trapFocus(e) {
        const focusableElements = this.getFocusableElements();
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }

    getFocusableElements() {
        return Array.from(this.root.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
    }

    requestClose() {
        if (typeof this.onRequestClose === 'function') {
            this.onRequestClose();
        }
    }

    async open(key) {
        const data = this.data[key];
        if (!data) {
            console.warn(`No chamber data found for key: ${key}`);
            return;
        }

        this.currentKey = key;
        this.isVisible = true;

        // Update content
        if (this.elements.label) this.elements.label.textContent = data.label || '';
        if (this.elements.title) this.elements.title.textContent = data.title || '';

        if (this.elements.body) {
            this.elements.body.innerHTML = '';
            (data.paragraphs || []).forEach(text => {
                const p = document.createElement('p');
                p.textContent = text;
                this.elements.body.appendChild(p);
            });
        }

        // Show panel
        this.root.setAttribute('aria-hidden', 'false');
        
        // Set focus for accessibility
        await this.waitForTransition();
        this.elements.close?.focus();
    }

    async close() {
        this.isVisible = false;
        this.currentKey = null;
        
        this.root.setAttribute('aria-hidden', 'true');
        
        // Wait for transition before moving focus
        await this.waitForTransition();
    }

    waitForTransition() {
        return new Promise(resolve => {
            const duration = this.isVisible ? CONFIG.timing.panelEnter : CONFIG.timing.panelExit;
            setTimeout(resolve, duration);
        });
    }
}

/**
 * Enhanced DepthView for document presentation
 */
class DepthView {
    constructor({ panelSelector, data, onRequestClose }) {
        this.root = document.querySelector(panelSelector);
        if (!this.root) {
            console.warn(`Depth view not found: ${panelSelector}`);
            return;
        }

        this.data = data || {};
        this.onRequestClose = onRequestClose;
        this.currentId = null;
        this.isVisible = false;

        this.elements = {
            kicker: this.root.querySelector('.depth-kicker'),
            title: this.root.querySelector('.depth-title'),
            subtitle: this.root.querySelector('.depth-subtitle'),
            body: this.root.querySelector('.depth-body'),
            close: this.root.querySelector('.depth-close'),
            scrim: this.root.querySelector('.depth-view__scrim')
        };

        this.bind();
        this.initAccessibility();
    }

    initAccessibility() {
        this.root.setAttribute('aria-hidden', 'true');
        this.root.setAttribute('aria-labelledby', 'depth-title');
        this.root.setAttribute('aria-describedby', 'depth-body');
    }

    bind() {
        const closeHandlers = [
            this.elements.close,
            this.elements.scrim
        ].filter(Boolean);

        closeHandlers.forEach(element => {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                this.requestClose();
            });
        });

        this.root.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.requestClose();
            }
            
            if (e.key === 'Tab') {
                this.trapFocus(e);
            }
        });
    }

    trapFocus(e) {
        const focusableElements = this.getFocusableElements();
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }

    getFocusableElements() {
        return Array.from(this.root.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
    }

    requestClose() {
        if (typeof this.onRequestClose === 'function') {
            this.onRequestClose();
        }
    }

    async open(id) {
        const doc = this.data[id];
        if (!doc) {
            console.warn(`No document found for id: ${id}`);
            return;
        }

        this.currentId = id;
        this.isVisible = true;

        // Update content
        if (this.elements.kicker) this.elements.kicker.textContent = doc.kicker || '';
        if (this.elements.title) this.elements.title.textContent = doc.title || '';
        if (this.elements.subtitle) this.elements.subtitle.textContent = doc.subtitle || '';

        if (this.elements.body) {
            this.elements.body.innerHTML = '';
            (doc.sections || []).forEach(section => {
                if (section.heading) {
                    const h = document.createElement('h3');
                    h.textContent = section.heading;
                    this.elements.body.appendChild(h);
                }
                (section.paragraphs || []).forEach(text => {
                    const p = document.createElement('p');
                    p.textContent = text;
                    this.elements.body.appendChild(p);
                });
            });
        }

        this.root.setAttribute('aria-hidden', 'false');
        
        await this.waitForTransition();
        this.elements.close?.focus();
    }

    async close() {
        this.isVisible = false;
        this.currentId = null;
        
        this.root.setAttribute('aria-hidden', 'true');
        await this.waitForTransition();
    }

    waitForTransition() {
        return new Promise(resolve => {
            const duration = this.isVisible ? CONFIG.timing.panelEnter : CONFIG.timing.panelExit;
            setTimeout(resolve, duration);
        });
    }
}

/**
 * Master application orchestrator
 */
class AlchemyApp {
    constructor() {
        this.stateMachine = new AppStateMachine();
        this.components = {};
        
        this.init()
            .then(() => {
                this.stateMachine.transitionTo(APP_STATES.IDLE);
            })
            .catch(error => {
                console.error('Failed to initialize AlchemyApp:', error);
                this.stateMachine.transitionTo(APP_STATES.ERROR, { error });
            });
    }

    async init() {
        // Remove no-js class
        document.documentElement.classList.remove('no-js');
        document.documentElement.classList.add('js');

        // Initialize components
        await this.initComponents();
        this.bindGlobalEvents();
        this.handleHash(); // Initial route

        // Hide loading state
        this.hideLoadingState();
    }

    async initComponents() {
        // Initialize Three.js experience
        this.components.void = new VoidExperience('#artifact-canvas');

        // Initialize navigation
        this.components.nav = new NavController({
            linkSelector: '.nav-links .link'
        });

        // Initialize panels
        this.components.chambers = new ChamberPanel({
            panelSelector: '#chamber-panel',
            data: CHAMBERS,
            onRequestClose: () => this.navigateTo('')
        });

        this.components.depthView = new DepthView({
            panelSelector: '#depth-view',
            data: DOCUMENTS,
            onRequestClose: () => this.navigateTo('')
        });

        // Cache DOM elements
        this.dom = {
            header: document.querySelector('.header-layer'),
            viewport: document.querySelector('.viewport'),
            navLayer: document.querySelector('.nav-layer'),
            metaPanel: document.querySelector('.meta-panel'),
            loading: document.querySelector('.loading-state')
        };

        // Set up state listeners
        this.stateMachine.addListener('ui', this.handleStateChange.bind(this));
    }

    bindGlobalEvents() {
        // Enhanced hash change handling
        window.addEventListener('hashchange', () => this.handleHash());
        
        // History API support
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.route) {
                this.handleHash();
            }
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && window.location.hash) {
                this.navigateTo('');
            }
        });

        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    setupPerformanceMonitoring() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.saveData) {
                // Adjust experience for data-saving mode
                console.info('Data saving mode enabled - optimizing experience');
            }
        }
    }

    handleStateChange(newState, oldState) {
        // Update UI based on state
        const isOverlayOpen = newState === APP_STATES.CHAMBER_OPEN || 
                             newState === APP_STATES.DEPTH_OPEN;

        // Update viewport
        if (this.dom.viewport) {
            this.dom.viewport.classList.toggle('viewport--dimmed', isOverlayOpen);
        }

        // Update navigation
        if (this.dom.navLayer) {
            this.dom.navLayer.classList.toggle('nav-layer--dimmed', isOverlayOpen);
        }

        // Dim the positioning tools
        if (this.dom.metaPanel) {
            this.dom.metaPanel.classList.toggle('meta-panel--dimmed', isOverlayOpen);
        }

        // Update header
        this.setHeaderCompact(isOverlayOpen);
    }

    setHeaderCompact(isCompact) {
        if (!this.dom.header) return;

        this.dom.header.classList.toggle('header-layer--compact', isCompact);

        // Update CSS custom property for smooth interpolation
        this.dom.header.style.setProperty('--header-scale', isCompact ? '0.82' : '1');
        this.dom.header.style.setProperty('--header-opacity', isCompact ? '0.74' : '1');
    }

    hideLoadingState() {
        if (this.dom.loading) {
            this.dom.loading.setAttribute('aria-hidden', 'true');
            
            // Remove from DOM after transition
            setTimeout(() => {
                if (this.dom.loading.parentNode) {
                    this.dom.loading.parentNode.removeChild(this.dom.loading);
                }
            }, 600);
        }
    }

    handleHash() {
        const raw = window.location.hash.replace(/^#/, '').trim();

        if (!raw) {
            this.goIdle();
            return;
        }

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

        // Chamber route
        if (CHAMBERS[raw]) {
            this.openChamber(raw);
            return;
        }

        // Unknown route
        this.goIdle();
    }

    navigateTo(route) {
        const targetHash = route ? `#${route}` : '#';

        if (window.location.hash !== targetHash) {
            window.history.pushState({ route }, '', targetHash);
        }

        this.handleHash();
    }

    async goIdle() {
        this.stateMachine.transitionTo(APP_STATES.IDLE);
        
        if (this.components.nav) this.components.nav.clearActive();
        if (this.components.chambers) await this.components.chambers.close();
        if (this.components.depthView) await this.components.depthView.close();
        
        this.setHeaderCompact(false);
    }

    async openChamber(key) {
        if (!this.components.chambers) return;

        this.stateMachine.transitionTo(APP_STATES.CHAMBER_OPEN, { chamber: key });
        
        if (this.components.depthView) await this.components.depthView.close();
        if (this.components.nav) this.components.nav.setActiveByChamber(key);
        
        await this.components.chambers.open(key);
        this.setHeaderCompact(true);
    }

    async openDocument(id) {
        if (!this.components.depthView) return;

        this.stateMachine.transitionTo(APP_STATES.DEPTH_OPEN, { document: id });
        
        if (this.components.chambers) await this.components.chambers.close();
        if (this.components.nav) this.components.nav.clearActive();
        
        await this.components.depthView.open(id);
        this.setHeaderCompact(true);
    }

    // Cleanup method for SPA navigation
    destroy() {
        if (this.components.void) {
            this.components.void.dispose();
        }
        
        this.stateMachine.removeListener('ui');
    }
}

// Enhanced chamber data with refined content
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

// Enhanced document structure
const DOCUMENTS = {
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

// Enhanced boot sequence with error handling
window.addEventListener('DOMContentLoaded', () => {
    // Set up error handling
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
