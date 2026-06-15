import * as THREE from 'three';

let scene, camera, renderer;
let geometries = [];
let animationId = null;

function createLowPolyGeometry() {
  const count = 4;
  const colors = [0xC9A34D, 0xE8D48B, 0x8B7D4B, 0x5C4F2E];

  for (let i = 0; i < count; i++) {
    const size = 0.4 + Math.random() * 0.8;
    const geometry = new THREE.IcosahedronGeometry(size, 0);
    const material = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
      wireframe: true,
      transparent: true,
      opacity: 0.15 + Math.random() * 0.2
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 8,
      -5 - Math.random() * 8
    );

    mesh.rotation.x = Math.random() * Math.PI * 2;
    mesh.rotation.y = Math.random() * Math.PI * 2;

    mesh.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.003,
      rotSpeedY: (Math.random() - 0.5) * 0.003,
      floatSpeed: 0.2 + Math.random() * 0.3,
      floatOffset: Math.random() * Math.PI * 2
    };

    scene.add(mesh);
    geometries.push(mesh);
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  geometries.forEach((mesh, i) => {
    mesh.rotation.x += mesh.userData.rotSpeedX;
    mesh.rotation.y += mesh.userData.rotSpeedY;
    mesh.position.y += Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 0.002;
  });

  renderer.render(scene, camera);
}

export function setupCanvas3D() {
  const container = document.getElementById('canvas-container');
  if (!container) return null;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  createLowPolyGeometry();
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return scene;
}

export function destroyCanvas3D() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (renderer) {
    renderer.dispose();
    renderer.domElement.remove();
  }
  geometries.forEach(mesh => {
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
  geometries = [];
}
