import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody, useRevoluteJoint } from '@react-three/rapier';
import React, { useEffect, useRef } from 'react';
import { Vector3 } from 'three';



function Tank(props) {
    const [subscribeKeys, getKeys] = useKeyboardControls()
    const rocket = useRef({current: null})
    const tank = useRef({current: null})
    const turret = useRef({current: null})
    const barrel = useRef()

    useEffect(() => {
        const unsubFire = subscribeKeys(
            state => state.fire,
            (value) => {
                if (value) fire()
            }
        )

        return () => {
            unsubFire()
        }
    }, [])
    
    const joint = useRevoluteJoint(tank, turret, [
        // Position of the joint in bodyA's local space
        [0, 0, 0],
        // Position of the joint in bodyB's local space
        [0, 0, 0],
        // Axis of the joint, expressed in the local-space of
        // the rigid-bodies it is attached to. Cannot be [0,0,0].
        [0, 1, 0]
    ]);

    const rotationSpeed = 1;

    useFrame((state, delta) => {
        if (!tank.current) return;
        if (!turret.current) return;

        const { forward, back, left, right, turretLeft, turretRight } = getKeys()
        const impulse = new Vector3(0, 0, 0);
        const impulseStrength = 25 * delta

        if (turretLeft) {
            turret.current.setAngvel(new Vector3(0, rotationSpeed * 0.5, 0), true);
        }
        if (turretRight) {
            turret.current.setAngvel(new Vector3(0, - rotationSpeed * 0.5, 0), true);
        }

        if (left) {
            tank.current.setAngvel(new Vector3(0, rotationSpeed, 0), true);
            turret.current.setAngvel(new Vector3(0, rotationSpeed, 0), true);
        }

        if (right) {
            tank.current.setAngvel(new Vector3(0, - rotationSpeed, 0), true);
            turret.current.setAngvel(new Vector3(0, - rotationSpeed, 0), true);
        }


        if (forward) {
            impulse.z -= impulseStrength
        }

        if (back) {
            impulse.z += impulseStrength
        }

        // Transform the impulse vector to match the tank's current rotation
        const worldImpulse = impulse.applyQuaternion(tank.current.rotation());

        // Apply the transformed impulse
        tank.current.applyImpulse(worldImpulse, true);

    })

    const fire = () => {
        console.log("Firing!")

        if (!rocket.current || !barrel.current) return;

        console.log(barrel.current)

        console.log(rocket.current)

        

        // // Position the rocket at the end of the barrel
        // const barrelEndPosition = new Vector3(0, 1, -1.35); // Match the barrel's position
        // turret.current.getWorldPosition(barrelEndPosition); // Convert to world coordinates
        // rocket.current.setTranslation(barrelEndPosition, true);
    
        // // Apply an impulse to the rocket to "fire" it
        // const fireImpulse = new Vector3(0, 0, -10); // Adjust the strength and direction
        // const worldFireImpulse = fireImpulse.applyQuaternion(turret.current.rotation());
        // rocket.current.applyImpulse(worldFireImpulse, true);
    
        // // Make the rocket visible
        // rocket.current.userData.visible = true;
    }

    return (
        <>
            <RigidBody 
                type="dynamic"
                canSleep={false} 
                ref={tank}
                colliders="cuboid"
                friction={1.2}
                linearDamping={0.5}
                angularDamping={0.5}
                >
                <mesh name="body" castShadow receiveShadow position={[ 0, 0.6, 0.2]}>
                    <boxGeometry args={[1.5, 0.4, 3]} />
                    <meshStandardMaterial color="#666666" />
                </mesh>
            </RigidBody>
            <RigidBody 
                type="dynamic"
                canSleep={false} 
                ref={turret}
                colliders="cuboid"
                friction={1.2}
                linearDamping={0.5}
                angularDamping={20}
                >
                <mesh name="turret-base" castShadow receiveShadow position={[ 0, 1, 0]}>
                    <boxGeometry args={[1, 0.3, 1]} />
                    <meshStandardMaterial color="#666666" />
                </mesh>
                <mesh ref={barrel} name="barrel" castShadow receiveShadow position={[ 0, 1, -1.35]}>
                    <boxGeometry args={[0.2, 0.2, 1.7]} />
                    <meshStandardMaterial color="#666666" />
                </mesh>
            </RigidBody>
            <RigidBody 
                ref={rocket} 
                type="dynamic" 
                canSleep={false} 
                colliders="cuboid" 
                friction={1.2} 
                linearDamping={0.5} 
                angularDamping={0.5}>  
                <mesh name="rocket" castShadow receiveShadow position={[ 0, 1, 0]}>
                    <boxGeometry args={[0.15, 0.15, 0.15]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </RigidBody>
        </>
    );
}

export default Tank;