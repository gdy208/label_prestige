import * as THREE from 'three';

let scene, particles, material;
let animationId = null;
let positions, velocities;

export function setupParticles(targetScene) {
  if (!targetScene) return;
  scene = targetScene;

  const count = 300;
  positions = new Float32Array(count * 3);
  velocities = [];

  const color = new THREE.Color('#C9A34D');

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    velocities.push({
      x: (Math.random() - 0.5) * 0.002,
      y: (Math.random() - 0.5) * 0.002
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  material = new THREE.PointsMaterial({
    color: color,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  animate();
}

function animate() {
  animationId = requestAnimationFrame(animate);

  const pos = particles.geometry.attributes.position.array;

  for (let i = 0; i < pos.length / 3; i++) {
    pos[i * 3] += velocities[i].x;
    pos[i * 3 + 1] += velocities[i].y;

    if (Math.abs(pos[i * 3]) > 15) velocities[i].x *= -1;
    if (Math.abs(pos[i * 3 + 1]) > 10) velocities[i].y *= -1;
  }

  particles.geometry.attributes.position.needsUpdate = true;
}

export function destroyParticles() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (particles) {
    particles.geometry.dispose();
    material.dispose();
    scene.remove(particles);
  }
}
