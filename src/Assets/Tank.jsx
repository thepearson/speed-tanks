import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody, useRevoluteJoint, RapierRigidBody } from '@react-three/rapier'; // Added RapierRigidBody for type hint
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three'; // Import THREE for Vector3 and Quaternion

function Tank(props) {
    const [subscribeKeys, getKeys] = useKeyboardControls()
    // Ensure refs have the correct type hint if using TypeScript
    const rocket = useRef(null);
    const tank = useRef(null);
    const turret = useRef(null);
    const barrel = useRef(null); // Ref for barrel mesh (optional for calculation, but kept)

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
    }, []) // Keep dependencies minimal

    const joint = useRevoluteJoint(tank, turret, [
        // Position of the joint in bodyA's local space
        [0, 0, 0], // Adjusted slightly based on mesh position in original code
        // Position of the joint in bodyB's local space
        [0, 0, 0],
        // Axis of the joint, expressed in the local-space of
        // the rigid-bodies it is attached to. Cannot be [0,0,0].
        [0, 1, 0]
    ]);

    const rotationSpeed = 1;

    // --- TANK MOVEMENT CODE (Unchanged as requested) ---
    useFrame((state, delta) => {
        if (!tank.current) return;
        if (!turret.current) return;

        const { forward, back, left, right, turretLeft, turretRight } = getKeys()
        const impulse = new THREE.Vector3(0, 0, 0); // Use THREE.Vector3
        const impulseStrength = 25 * delta

        if (turretLeft) {
            turret.current.setAngvel(new THREE.Vector3(0, rotationSpeed * 0.5, 0), true);
        } else if (turretRight) { // Added else if to prevent conflicting angvel sets
            turret.current.setAngvel(new THREE.Vector3(0, - rotationSpeed * 0.5, 0), true);
        } else {
             // Optional: Explicitly stop turret rotation if no input
             if(turret.current.angvel().y !== 0) { // Only set if not already zero
                 turret.current.setAngvel(new THREE.Vector3(0, 0, 0), true);
             }
        }

        if (left) {
            tank.current.setAngvel(new THREE.Vector3(0, rotationSpeed, 0), true);
            turret.current.setAngvel(new THREE.Vector3(0, rotationSpeed, 0), true);
        }

        if (right) {
            tank.current.setAngvel(new THREE.Vector3(0, - rotationSpeed, 0), true);
            turret.current.setAngvel(new THREE.Vector3(0, - rotationSpeed, 0), true);
        }
        // if (left) {
        //     tank.current.setAngvel(new THREE.Vector3(0, rotationSpeed, 0), true);
        //     // Turret rotation with tank happens implicitly due to hierarchy/joint unless overridden above
        //     // turret.current.setAngvel(new THREE.Vector3(0, rotationSpeed, 0), true); // This might fight the joint/other inputs
        // } else if (right) { // Added else if
        //     tank.current.setAngvel(new THREE.Vector3(0, - rotationSpeed, 0), true);
        //     // turret.current.setAngvel(new THREE.Vector3(0, - rotationSpeed, 0), true); // This might fight the joint/other inputs
        // } else {
        //      // Optional: Explicitly stop tank rotation if no input
        //      if (tank.current.angvel().y !== 0) { // Only set if not already zero
        //         tank.current.setAngvel(new THREE.Vector3(0, 0, 0), true);
        //      }
        // }


        if (forward) {
            impulse.z -= impulseStrength
        }

        if (back) {
            impulse.z += impulseStrength
        }

        // Transform the impulse vector to match the tank's current rotation
        // Clone impulse before applying quaternion to avoid modifying it for next frame
        const worldImpulse = impulse.clone().applyQuaternion(tank.current.rotation());

        // Apply the transformed impulse
        if (worldImpulse.lengthSq() > 0) { // Only apply if there is an impulse
             tank.current.applyImpulse(worldImpulse, true);
        }

    })
    // --- END OF TANK MOVEMENT CODE ---


    // --- ROCKET FIRING LOGIC ---
    const fire = () => {
        console.log("Firing!");

        // Ensure refs are ready
        if (!rocket.current || !turret.current) {
            console.error("Rocket or Turret ref not available!");
            return;
        }

        // --- 1. Calculate Barrel Tip Position ---
        // Barrel mesh local position relative to turret RB: [0, 1, -1.35]
        // Barrel mesh geometry Z length: 1.7, so half-length is 0.85
        // Tip position relative to turret RB origin: [0, 1, -1.35 - 0.85] = [0, 1, -2.2]
        const barrelTipLocalOffset = new THREE.Vector3(0, 1, -2.2);

        // Get turret's current world position and rotation
        const turretWorldPosition = turret.current.translation();
        const turretWorldRotation = turret.current.rotation(); // This is a Quaternion

        // Apply turret's world rotation to the local offset, then add turret's world position
        const rocketWorldPosition = barrelTipLocalOffset // Start with local offset
            .clone() // Work with a copy
            .applyQuaternion(turretWorldRotation) // Rotate offset to world orientation
            .add(turretWorldPosition); // Add turret's world position


        // --- 2. Calculate Firing Direction ---
        const localForward = new THREE.Vector3(0, 0, -1); // Local forward (-Z)

        // Rotate the local forward vector by the turret's world rotation
        const worldFireDirection = localForward.clone().applyQuaternion(turretWorldRotation);

        // --- 3. Prepare and Fire Rocket ---
        const fireImpulseStrength = 0.1; // Adjust force as needed
        const worldImpulse = worldFireDirection.multiplyScalar(fireImpulseStrength);

        // Reset rocket's velocity before applying new impulse/position
        rocket.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rocket.current.setAngvel({ x: 0, y: 0, z: 0 }, true);

        // Position the rocket at the calculated barrel tip world position
        rocket.current.setTranslation(rocketWorldPosition, true);

        // Apply the impulse to fire the rocket
        rocket.current.applyImpulse(worldImpulse, true);

        console.log("Rocket fired from:", rocketWorldPosition);
        console.log("Applied impulse:", worldImpulse);

        // Optional: Make the rocket visible if it was initially hidden
        // This assumes the mesh is a direct child of the RigidBody
        // const rocketMesh = rocket.current.children[0];
        // if (rocketMesh) {
        //    rocketMesh.visible = true;
        // }
    }
    // --- END OF ROCKET FIRING LOGIC ---

    return (
        <>
            {/* --- TANK AND TURRET (Unchanged) --- */}
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
                colliders="cuboid" // Consider setting colliders={false} and adding manual <CuboidCollider> for turret base/barrel
                friction={1.2}
                linearDamping={0.5}
                angularDamping={20} // High angular damping helps stop turret rotation
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

            {/* --- ROCKET (Unchanged Structure) --- */}
            <RigidBody
                ref={rocket}
                type="dynamic"
                canSleep={false} // Keep awake initially for firing
                colliders="ball"
                gravityScale={1} // Optional: Reduce gravity effect on rocket
                friction={0.5}
                mass={250}
                linearDamping={0.1} // Low damping for projectile motion
                angularDamping={0.5}
                position={[0, -100, 0]} // Start the rocket far away / hidden
                >
                {/* Make rocket mesh visible only when needed? Or always visible */}
                <mesh name="rocket" castShadow receiveShadow /* position is controlled by RigidBody */>
                    <sphereGeometry args={[0.08, 8, 8]} /> {/* Made slightly longer */}
                    <meshStandardMaterial color="#000000" /> {/* Changed color */}
                </mesh>
            </RigidBody>
        </>
    );
}

export default Tank;