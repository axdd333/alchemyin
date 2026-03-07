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
        uPointer: { value: this.pointer }
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
        varying vec2 vUv;

        float circle(vec2 uv, vec2 center, float radius, float blur) {
          return smoothstep(radius + blur, radius - blur, distance(uv, center));
        }

        void main() {
          vec2 uv = vUv;
          vec2 centered = uv - 0.5;
          float vignette = smoothstep(0.95, 0.12, dot(centered, centered));
          float pulse = 0.5 + 0.5 * sin(uTime * 0.22);
          float ribbon = 0.5 + 0.5 * sin((uv.y + uTime * 0.035) * 11.0);
          float halo = circle(
            uv,
            vec2(0.5 + uPointer.x * 0.05, 0.5 - uPointer.y * 0.04),
            0.34 + pulse * 0.04,
            0.28
          );
          float flare = circle(uv, vec2(0.72, 0.34), 0.16, 0.2);

          vec3 warm = vec3(0.88, 0.74, 0.53);
          vec3 cool = vec3(0.39, 0.57, 0.68);
          vec3 paper = vec3(0.98, 0.96, 0.92);

          vec3 color = mix(warm, cool, clamp(uv.x * 0.82 + ribbon * 0.12, 0.0, 1.0));
          color = mix(color, paper, halo * 0.72);
          color += flare * vec3(0.09, 0.12, 0.16);

          gl_FragColor = vec4(color, vignette * 0.14);
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

    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 3.8;
      const offset = index * 3;

      positions[offset] = Math.cos(angle) * radius;
      positions[offset + 1] = (Math.random() - 0.5) * 3.8;
      positions[offset + 2] = (Math.random() - 0.5) * 4;
      scales[index] = 0.8 + Math.random() * 1.6;
      phases[index] = Math.random() * Math.PI * 2;
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
        uPointer: { value: this.pointer }
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uPointer;
        attribute float aScale;
        attribute float aPhase;
        varying float vAlpha;

        void main() {
          vec3 transformed = position;
          transformed.y += sin(uTime * 0.42 + aPhase) * 0.07;
          transformed.x += cos(uTime * 0.3 + aPhase) * 0.03;
          transformed.xy += vec2(uPointer.x, -uPointer.y) * 0.08;

          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_PointSize = aScale * 110.0 / -mvPosition.z;
          vAlpha = 0.35 + 0.4 * (0.5 + 0.5 * sin(uTime * 0.34 + aPhase));
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

    this.pointer.lerp(this.pointerTarget, 0.06);

    this.atmosphereMaterial.uniforms.uTime.value = elapsed;
    this.particleMaterial.uniforms.uTime.value = elapsed;

    this.illustration.rotation.y += delta * 0.08;
    this.illustration.rotation.x = this.pointer.y * 0.12;
    this.illustration.rotation.z = this.pointer.x * 0.08;
    this.illustration.position.x += (this.pointer.x * 0.35 - this.illustration.position.x) * 0.08;
    this.illustration.position.y += (this.pointer.y * 0.28 - this.illustration.position.y) * 0.08;

    this.camera.position.x += (this.pointer.x * 0.85 - this.camera.position.x) * 0.06;
    this.camera.position.y += (-this.pointer.y * 0.5 - this.camera.position.y) * 0.06;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private updateSize(): void {
    const { width, height } = this.canvas.getBoundingClientRect();
    const safeWidth = Math.max(width, 1);
    const safeHeight = Math.max(height, 1);

    this.camera.aspect = safeWidth / safeHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(safeWidth, safeHeight, false);
  }

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const bounds = this.canvas.getBoundingClientRect();
    const localX = (event.clientX - bounds.left) / Math.max(bounds.width, 1);
    const localY = (event.clientY - bounds.top) / Math.max(bounds.height, 1);

    this.pointerTarget.x = (localX - 0.5) * 2;
    this.pointerTarget.y = (localY - 0.5) * 2;
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
