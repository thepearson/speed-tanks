import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import Tank from './Assets/Tank'
import Lights from './Assets/Lights'
import { Physics } from '@react-three/rapier'
import Environment from './Assets/Environment'
import PineTree from './Assets/PineTree'

export default function Experience()
{
    return <>

        <Perf position="top-left" />

        <OrbitControls makeDefault />

        <Physics>
            <Lights />
            <Tank />
            {[...Array(200)].map((o, i) => {
                return <PineTree key={i} position={[(Math.random() - 0.5) * 100, 0, (Math.random() - 0.5) * 100]} />
            })}
            <Environment />
        </Physics>

    </>
}