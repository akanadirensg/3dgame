import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createMouse(
  scene: THREE.Scene,
  mixers: THREE.AnimationMixer[],
  obstacles: THREE.Object3D[] // liste des objets à éviter
): {
  group: THREE.Group,
  update: (delta: number) => void
} {

  const group = new THREE.Group();
  scene.add(group);

  const loader = new GLTFLoader();

  const models = [
    '/models/Crab.gltf',
    '/models/Bee.gltf',
    '/models/Enemy.gltf',
    '/models/Skull.gltf'
  ];

  // Tirage aléatoire
  const randomModel = models[Math.floor(Math.random() * models.length)];

  let mixer: THREE.AnimationMixer | null = null;

  loader.load(randomModel, (gltf) => {

    const model = gltf.scene;
    model.scale.set(0.3, 0.3, 0.3);
    model.position.set(3, 0.1, 7);

    group.add(model);

    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
      mixers.push(mixer);
    }

  });

  // Raycaster pour collisions
  const raycaster = new THREE.Raycaster();
  const forward = new THREE.Vector3(0, 0, 1);

  const speed = 2;

  // fonction de màj
  function update(delta: number) {
    // update animation
    if (mixer) mixer.update(delta);

    // direction devant le modèle
    const dir = forward.clone().applyQuaternion(group.quaternion).normalize();

    // position futur
    const nextPos = group.position.clone().add(dir.clone().multiplyScalar(speed * delta));

    // test collision
    raycaster.set(group.position, dir);
    const intersects = raycaster.intersectObjects(obstacles, true);

    if (intersects.length === 0 || intersects[0].distance > 0.5) {
      // pas de collision proche → avancer
      group.position.copy(nextPos);
    } else {
      // collision → tourner aléatoirement
      group.rotation.y += Math.random() * Math.PI / 2 - Math.PI / 4;
    }
  }

  return { group, update };
}
