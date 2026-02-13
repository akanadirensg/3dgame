"use strict";
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';


import { createGround } from './entities/ground';
import { createCity } from './entities/city';
import { createMouse } from './entities/mouse';

export function initScene(container: HTMLElement) {

  const scene = new THREE.Scene();

  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);


  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor("#53EAED", 1); // couleur hex + alpha (1 = opaque)


  container.appendChild(renderer.domElement);

  const world = new THREE.Group();
  scene.add(world);  

  
  // Le sol 
  const groundGroup = new THREE.Group();
  world.add(groundGroup);
  // Buildings 
  const buildingsGroup = new THREE.Group();
  world.add(buildingsGroup);
  // Le routes
  const roadsGroup = new THREE.Group();
  groundGroup.add(createGround());
  world.add(roadsGroup);



  // Création de la ville contenant les routes et les bati
  createCity(buildingsGroup, roadsGroup, 5);





  // camera.position.set(40, 60, 40);
  camera.position.set (4.5, 0.5, 8.5);
  camera.lookAt(0, 0, 0);



  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(50, 100, 50);
  scene.add(dirLight);



  const ambLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambLight);



  const mixers: THREE.AnimationMixer[] = [];


const mouseData = createMouse(scene, mixers, [buildingsGroup]);




  const clock = new THREE.Clock();

  





  const controls = new PointerLockControls(camera, renderer.domElement);
  scene.add(controls.object);


  // Activer la souris
  renderer.domElement.addEventListener('click', () => {
    controls.lock();
  });
  const keys: Record<string, boolean> = {};

  window.addEventListener('keydown', (event) => {
    keys[event.code] = true;
  });

  window.addEventListener('keyup', (event) => {
    keys[event.code] = false;
  });



  const speed = 6;

  function animate() {
    renderer.setAnimationLoop(animate);

    const delta = clock.getDelta();
    const moveDistance = speed * delta;

    if (controls.isLocked === true) {

      const direction = new THREE.Vector3();
      controls.getDirection(direction);

      // vecteur droite
      const right = new THREE.Vector3();
      right.crossVectors(direction, camera.up).normalize();

      if (keys['KeyW']) {
        camera.position.addScaledVector(direction, moveDistance);
      }
      if (keys['KeyS']) {
        camera.position.addScaledVector(direction, -moveDistance);
      }
      if (keys['KeyA']) {
        camera.position.addScaledVector(right, -moveDistance);
      }
      if (keys['KeyD']) {
        camera.position.addScaledVector(right, moveDistance);
      }
    }
      mouseData.update(delta);


    for (const mixer of mixers) {
      mixer.update(delta);
    }



    renderer.render(scene, camera);
  }


  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
