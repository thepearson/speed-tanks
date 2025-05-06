import { RigidBody } from '@react-three/rapier';
import React from 'react';
import * as THREE from 'three'

const trunk = new THREE.CylinderGeometry(0.5, 0.5, 1, 5)
const leaves = new THREE.ConeGeometry(1, 3, 10)
const trunkMaterial = new THREE.MeshStandardMaterial({ flatShading: true, color: 'saddlebrown' })
const leavesMaterial = new THREE.MeshStandardMaterial({ flatShading: true, color: 'forestgreen' })

function PineTree({position = [0, 0, 0]}) {
    return (
        <RigidBody 
            position={position}
            colliders="hull"
            mass={1}
            >
        <group>
            <mesh 
                geometry={trunk}
                material={trunkMaterial}
                castShadow 
                receiveShadow 
                position={[0, -0.5, 0]}
                 />
            <mesh 
                geometry={leaves}
                material={leavesMaterial}
                castShadow 
                receiveShadow 
                position={[0, 1, 0]} />
        </group>
        </RigidBody>
    );
}

export default PineTree;