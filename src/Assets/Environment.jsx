import { RigidBody } from '@react-three/rapier';
import React from 'react';

function Environment(props) {
    return (
        <RigidBody type='fixed'>
            <mesh receiveShadow position-y={ - 1.25 }>
                <boxGeometry args={ [ 100, 0.5, 100 ] } />
                <meshStandardMaterial color="greenyellow" />
            </mesh>
        </RigidBody>
    );
}

export default Environment;