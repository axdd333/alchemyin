import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  DirectionalLight,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
  WireframeGeometry
} from 'three';

export class HeroScene {
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(34, 1, 0.1, 100);
  private readonly renderer: WebGLRenderer;
  private readonly clock = new Clock();
  private readonly pointer = new Vector2();
  private readonly pointerTarget = new Vector2();
  private readonly illustration = new Group();
  private readonly atmosphereMaterial: ShaderMaterial;
  private readonly particleMaterial: ShaderMaterial;
  private resizeObserver?: ResizeObserver;
  private rafId = 0;
  private isRunning = false;
  private compactViewport = false;
  private presentation = 1;
  private presentationTarget = 1;
  private readonly testMode = new URL(window.location.href).searchParams.has('test-mode');

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.position.set(0, 0, 9.5);
    this.scene.add(this.illustration);

    this.atmosphereMaterial = this.createAtmosphere();
    this.particleMaterial = this.createParticles();
    this.createAstrolabe();
    this.createLights();
    this.updateSize();
    this.bind();
    if (this.testMode) {
      this.render();
    } else {
      this.start();
    }
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.resizeObserver?.disconnect();

    this.scene.traverse((object) => {
      const disposableGeometry = object as { geometry?: { dispose: () => void } };
      const disposableMaterial = object as {
        material?:
          | { dispose: () => void }
          | Array<{ dispose: () => void }>;
      };

      disposableGeometry.geometry?.dispose();

      if (Array.isArray(disposableMaterial.material)) {
        disposableMaterial.material.forEach((material) => material.dispose());
      } else {
        disposableMaterial.material?.dispose();
      }
    });

    this.renderer.dispose();
  }

  setPresentationMode(mode: 'idle' | 'overlay'): void {
    this.presentationTarget = mode === 'overlay' ? 0.34 : 1;
  }

  private createLights(): void {
    const ambient = new AmbientLight(0xffffff, 0.72);
    const keyLight = new DirectionalLight(0xffffff, 0.48);
    const fillLight = new DirectionalLight(0xc9d8f0, 0.2);

    keyLight.position.set(4, 6, 7);
    fillLight.position.set(-5, -2, 3);

    this.scene.add(ambient, keyLight, fillLight);
  }

  private createAtmosphere(): ShaderMaterial {
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: this.pointer },
        uPresentation: { value: this.presentation }
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uPresentation;
        varying vec2 vUv;

        float circle(vec2 uv, vec2 center, float radius, float blur) {
          return smoothstep(radius + blur, radius - blur, distance(uv, center));
        }

        void main() {
          vec2 uv = vUv;
          vec2 refracted = uv + vec2(uPointer.x * 0.024, -uPointer.y * 0.02) * (0.35 + uPresentation * 0.65);
          vec2 centered = uv - 0.5;
          float vignette = smoothstep(0.95, 0.12, dot(centered, centered));
          float pulse = 0.5 + 0.5 * sin(uTime * 0.18);
          float ribbon = 0.5 + 0.5 * sin((refracted.y * 12.0 + uTime * 0.16) + refracted.x * 3.2);
          float halo = circle(
            refracted,
            vec2(0.5 + uPointer.x * 0.05, 0.5 - uPointer.y * 0.04),
            0.33 + pulse * 0.05,
            0.3
          );
          float secondaryHalo = circle(
            refracted,
            vec2(0.34 - uPointer.x * 0.028, 0.67 + uPointer.y * 0.022),
            0.21 + pulse * 0.025,
            0.22
          );
          float flare = circle(refracted, vec2(0.72, 0.34), 0.16, 0.2);
          float sweep = smoothstep(
            0.8,
            0.98,
            sin((refracted.x * 1.26 - refracted.y * 0.72 + uTime * 0.04) * 6.28318) * 0.5 + 0.5
          );
          float causticA = sin(refracted.x * 18.0 + uTime * 0.52 + sin(refracted.y * 10.0 - uTime * 0.28)) * 0.5 + 0.5;
          float causticB = sin(refracted.y * 16.0 - uTime * 0.38 + cos(refracted.x * 13.0 + uTime * 0.32)) * 0.5 + 0.5;
          float caustics = smoothstep(0.72, 1.0, causticA * causticB);
          float edgeDistance = min(min(uv.x, uv.y), min(1.0 - uv.x, 1.0 - uv.y));
          float fresnel = 1.0 - smoothstep(0.03, 0.28, edgeDistance);

          vec3 warm = vec3(0.88, 0.74, 0.53);
          vec3 cool = vec3(0.39, 0.57, 0.68);
          vec3 paper = vec3(0.98, 0.96, 0.92);

          vec3 color = mix(warm, cool, clamp(refracted.x * 0.8 + ribbon * 0.14, 0.0, 1.0));
          color = mix(color, paper, halo * 0.68 + secondaryHalo * 0.16);
          color += flare * vec3(0.09, 0.12, 0.16);
          color += sweep * vec3(0.16, 0.15, 0.14) * (0.04 + uPresentation * 0.06);
          color += caustics * vec3(0.15, 0.17, 0.2) * (0.02 + uPresentation * 0.05);
          color += fresnel * vec3(0.13, 0.12, 0.1) * (0.025 + uPresentation * 0.035);

          gl_FragColor = vec4(color, vignette * (0.08 + uPresentation * 0.08));
        }
      `
    });

    const plane = new Mesh(new PlaneGeometry(16, 10), material);
    plane.position.z = -3.8;
    this.scene.add(plane);

    return material;
  }

  private createParticles(): ShaderMaterial {
    const count = 180;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);
    const random = this.testMode ? this.createSeededRandom(1337) : Math.random;

    for (let index = 0; index < count; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 1.2 + random() * 3.8;
      const offset = index * 3;

      positions[offset] = Math.cos(angle) * radius;
      positions[offset + 1] = (random() - 0.5) * 3.8;
      positions[offset + 2] = (random() - 0.5) * 4;
      scales[index] = 0.8 + random() * 1.6;
      phases[index] = random() * Math.PI * 2;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new BufferAttribute(scales, 1));
    geometry.setAttribute('aPhase', new BufferAttribute(phases, 1));

    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: this.pointer },
        uPresentation: { value: this.presentation }
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uPresentation;
        attribute float aScale;
        attribute float aPhase;
        varying float vAlpha;

        void main() {
          vec3 transformed = position;
          transformed.y += sin(uTime * 0.42 + aPhase) * 0.07;
          transformed.x += cos(uTime * 0.3 + aPhase) * 0.03;
          transformed.xy += vec2(uPointer.x, -uPointer.y) * (0.035 + uPresentation * 0.045);

          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_PointSize = aScale * (78.0 + uPresentation * 32.0) / -mvPosition.z;
          vAlpha = (0.24 + 0.38 * uPresentation) * (0.5 + 0.5 * sin(uTime * 0.34 + aPhase));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float alpha = smoothstep(0.48, 0.0, distanceToCenter) * vAlpha;
          vec3 color = mix(vec3(0.83, 0.65, 0.41), vec3(0.36, 0.56, 0.72), gl_PointCoord.y);
          gl_FragColor = vec4(color, alpha * 0.45);
        }
      `
    });

    const points = new Points(geometry, material);
    this.scene.add(points);

    return material;
  }

  private createAstrolabe(): void {
    const brass = new Color(0x835b33);
    const ink = new Color(0x201612);

    const brassLine = new LineBasicMaterial({
      color: brass,
      transparent: true,
      opacity: 0.34
    });

    const inkLine = new LineBasicMaterial({
      color: ink,
      transparent: true,
      opacity: 0.15
    });

    const ring = new LineSegments(
      new EdgesGeometry(new TorusGeometry(2.85, 0.045, 6, 120)),
      brassLine
    );
    ring.rotation.x = Math.PI / 2.4;
    ring.rotation.z = Math.PI / 5.2;
    this.illustration.add(ring);

    const meridian = new LineSegments(
      new EdgesGeometry(new TorusGeometry(1.62, 0.03, 6, 84)),
      brassLine
    );
    meridian.rotation.y = Math.PI / 1.85;
    meridian.rotation.x = Math.PI / 10;
    this.illustration.add(meridian);

    const sphere = new LineSegments(
      new WireframeGeometry(new SphereGeometry(1.22, 14, 12)),
      inkLine
    );
    sphere.scale.set(1.02, 1.02, 1.02);
    this.illustration.add(sphere);

    const core = new LineSegments(
      new EdgesGeometry(new IcosahedronGeometry(0.48, 0)),
      new LineBasicMaterial({
        color: 0x1e1711,
        transparent: true,
        opacity: 0.36
      })
    );
    this.illustration.add(core);

    const baseArc = new LineSegments(
      new EdgesGeometry(new TorusGeometry(3.35, 0.03, 4, 110, Math.PI * 1.38)),
      new LineBasicMaterial({
        color: brass,
        transparent: true,
        opacity: 0.22
      })
    );
    baseArc.rotation.z = Math.PI / 4.2;
    baseArc.position.y = 0.1;
    this.illustration.add(baseArc);

    const floor = new LineSegments(
      new EdgesGeometry(new PlaneGeometry(8.4, 5.4, 12, 8)),
      inkLine
    );
    floor.rotation.x = -Math.PI / 2 + 0.18;
    floor.position.y = -2.55;
    floor.position.z = -0.6;
    this.illustration.add(floor);
  }

  private bind(): void {
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateSize();
      });
      this.resizeObserver.observe(this.canvas);
      if (this.canvas.parentElement) {
        this.resizeObserver.observe(this.canvas.parentElement);
      }
    }
  }

  private start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    const loop = (): void => {
      this.rafId = requestAnimationFrame(loop);
      this.render();
    };

    this.rafId = requestAnimationFrame(loop);
  }

  private render(): void {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();
    const viewportScale = this.compactViewport ? 0.78 : 1;

    this.presentation += (this.presentationTarget - this.presentation) * 0.06;
    this.pointer.lerp(this.pointerTarget, 0.038);

    this.atmosphereMaterial.uniforms.uTime.value = elapsed;
    this.atmosphereMaterial.uniforms.uPresentation.value = this.presentation;
    this.particleMaterial.uniforms.uTime.value = elapsed;
    this.particleMaterial.uniforms.uPresentation.value = this.presentation;

    this.illustration.rotation.y += delta * (0.032 + this.presentation * 0.028);
    this.illustration.rotation.x +=
      ((this.pointer.y * 0.078 * viewportScale * this.presentation) - this.illustration.rotation.x) *
      0.045;
    this.illustration.rotation.z +=
      ((this.pointer.x * 0.06 * viewportScale * this.presentation) - this.illustration.rotation.z) *
      0.045;
    this.illustration.position.x +=
      (this.pointer.x * 0.22 * viewportScale * this.presentation - this.illustration.position.x) * 0.055;
    this.illustration.position.y +=
      (this.pointer.y * 0.18 * viewportScale * this.presentation - this.illustration.position.y) * 0.055;

    this.camera.position.x +=
      (this.pointer.x * 0.48 * viewportScale * this.presentation - this.camera.position.x) * 0.045;
    this.camera.position.y +=
      (-this.pointer.y * 0.28 * viewportScale * this.presentation - this.camera.position.y) * 0.045;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private createSeededRandom(seed: number): () => number {
    let state = seed >>> 0;

    return () => {
      state += 0x6d2b79f5;
      let result = Math.imul(state ^ (state >>> 15), 1 | state);
      result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  private updateSize(): void {
    const { width, height } = this.canvas.getBoundingClientRect();
    const safeWidth = Math.max(width, 1);
    const safeHeight = Math.max(height, 1);
    this.compactViewport = safeWidth < 960;

    this.camera.aspect = safeWidth / safeHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(safeWidth, safeHeight, false);
  }

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const bounds = this.canvas.getBoundingClientRect();
    const localX = Math.min(Math.max((event.clientX - bounds.left) / Math.max(bounds.width, 1), 0), 1);
    const localY = Math.min(Math.max((event.clientY - bounds.top) / Math.max(bounds.height, 1), 0), 1);

    this.pointerTarget.x = (localX - 0.5) * 1.35;
    this.pointerTarget.y = (localY - 0.5) * 1.35;
  };

  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      cancelAnimationFrame(this.rafId);
      this.isRunning = false;
      return;
    }

    this.clock.getDelta();
    this.start();
  };
}
