import * as THREE from 'three';
import type { BuildingOptions } from '../types/building';

export function createBuilding(
  buildingsGroup: THREE.Group,
  options: BuildingOptions = {}
): THREE.Group {

  const {
    width = 2,
    depth = 2,
    height = Math.random() * 10 + 5,
    position = new THREE.Vector3(0, 0, 0),
    color = 0x808080
  } = options;

  const buildingGroup = new THREE.Group();

  // Geometry
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshLambertMaterial({ color });

  const mesh = new THREE.Mesh(geometry, material);

  
  mesh.position.y = height / 2;

  buildingGroup.add(mesh);

  buildingGroup.position.copy(position);

  buildingsGroup.add(buildingGroup);

  return buildingGroup;
}
