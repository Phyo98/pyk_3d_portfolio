import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03070d, 0.011);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 42;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const shardColors = [0x7ae7ff, 0xff8e6e, 0xffe082, 0x89a7ff];
    const shards: THREE.Mesh[] = [];

    for (let index = 0; index < 34; index += 1) {
      const geometry = new THREE.IcosahedronGeometry(Math.random() * 1.8 + 0.7, 0);
      const material = new THREE.MeshBasicMaterial({
        color: shardColors[index % shardColors.length],
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 140,
        (Math.random() - 0.5) * 90,
        (Math.random() - 0.5) * 100
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      scene.add(mesh);
      shards.push(mesh);
    }

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 900;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let index = 0; index < particleCount; index += 1) {
      const offset = index * 3;
      positions[offset] = (Math.random() - 0.5) * 200;
      positions[offset + 1] = (Math.random() - 0.5) * 120;
      positions[offset + 2] = (Math.random() - 0.5) * 120;
      velocities[index] = 0.03 + Math.random() * 0.05;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xbceeff,
      size: 0.65,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const ribbons: Array<{ mesh: THREE.Line; speed: number; drift: number }> = [];

    for (let index = 0; index < 18; index += 1) {
      const points = [];
      const baseX = (Math.random() - 0.5) * 90;
      const baseY = (Math.random() - 0.5) * 60;
      const baseZ = (Math.random() - 0.5) * 80;

      for (let step = 0; step < 18; step += 1) {
        points.push(
          new THREE.Vector3(
            baseX + Math.sin(step * 0.35) * 7,
            baseY + step * 1.2,
            baseZ + Math.cos(step * 0.35) * 7
          )
        );
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(60));
      const material = new THREE.LineBasicMaterial({
        color: shardColors[index % shardColors.length],
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
      });

      const mesh = new THREE.Line(geometry, material);
      scene.add(mesh);
      ribbons.push({
        mesh,
        speed: 0.0012 + Math.random() * 0.002,
        drift: Math.random() * Math.PI * 2,
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    let animationFrame = 0;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate);
      time += 0.008;

      shards.forEach((shard, index) => {
        shard.rotation.x += 0.0025;
        shard.rotation.y += 0.003;
        shard.position.y += Math.sin(time + index) * 0.02;
        (shard.material as THREE.MeshBasicMaterial).opacity = 0.07 + Math.sin(time * 1.7 + index) * 0.06;
      });

      const particlePositions = particles.geometry.attributes.position.array as Float32Array;
      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        particlePositions[offset + 1] += velocities[index];
        particlePositions[offset] += Math.sin(time + index) * 0.006;

        if (particlePositions[offset + 1] > 70) {
          particlePositions[offset + 1] = -70;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.0005;

      ribbons.forEach(({ mesh, speed, drift }, index) => {
        mesh.rotation.y += speed;
        mesh.rotation.x = Math.sin(time + drift) * 0.15;
        (mesh.material as THREE.LineBasicMaterial).opacity = 0.08 + Math.sin(time * 2 + index) * 0.08;
      });

      camera.position.x += (mouseX * 8 - camera.position.x) * 0.04;
      camera.position.y += (mouseY * 6 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

      shards.forEach((shard) => {
        shard.geometry.dispose();
        (shard.material as THREE.Material).dispose();
      });

      particleGeometry.dispose();
      particleMaterial.dispose();

      ribbons.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="fixed left-0 top-0 -z-10 h-full w-full" />;
}
