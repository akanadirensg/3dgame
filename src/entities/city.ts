import * as THREE from 'three';
import { createBuilding } from './building';
import { createRoad } from './roads';

export function createCity(
  buildingsGroup: THREE.Group,
  roadsGroup: THREE.Group,
  size: number
) {
  const spacing = 8;
  const roadWidth = 8;
  const roadlength = 4;

  for (let x = -size; x <= size; x++) {
    for (let z = -size; z <= size; z++) {
      // Créer le building
      createBuilding(buildingsGroup, {
        width: 3 ,
        depth: 3 ,
        height: 5 + Math.random() * 20,
        position: new THREE.Vector3(
          x * spacing,
          0,
          z * spacing
        ),
        color: 0x555555 + Math.random() * 0x222222
      });

    }
  }
  for (let x =-size -0.5 ; x <= size +0.5; x++) {
    for (let z = -size-0.5; z <=size +0.5; z++) {
      createRoad(roadsGroup, new THREE.Vector3(x * spacing , 0, z * spacing),
        roadWidth,     
        roadlength )
    }
  }
for (let z = -size-0.5; z <=size +0.5; z++){
     for (let x =-size -0.5 ; x <= size +0.5; x++) {
      createRoad(roadsGroup, new THREE.Vector3(x * spacing , 0, z * spacing),
      roadlength,
      roadWidth,     
    )

    }
  }


  
}
