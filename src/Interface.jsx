import React, { useRef } from 'react';
import { useKeyboardControls } from '@react-three/drei';


function Interface(props) {
    const time = useRef();

    const forward = useKeyboardControls(state => state.forward)
    const back = useKeyboardControls(state => state.back)
    const left = useKeyboardControls(state => state.left)
    const right = useKeyboardControls(state => state.right)
    const fire = useKeyboardControls(state => state.fire)
    const turretLeft = useKeyboardControls(state => state.turretLeft)
    const turretRight = useKeyboardControls(state => state.turretRight)

    
    return (
        <div className="interface">
            {/* Controls */}
            <div className="controls">
                <div className="raw">
                    <div className={`key ${forward ? 'active' : ''}`}>W</div>
                </div>
                <div className="raw">
                    <div className={`key ${left ? 'active' : ''}`}>A</div>
                    <div className={`key ${back ? 'active' : ''}`}>S</div>
                    <div className={`key ${right ? 'active' : ''}`}>D</div>
                </div>
                <div className="raw">
                    <div className={`key ${turretLeft ? 'active' : ''}`}>O</div>
                    <div className={`key ${turretRight ? 'active' : ''}`}>P</div>
                </div> 
                <div className="raw">
                    <div className={`key large ${fire ? 'active' : ''}`}>SPACE</div>
                </div> 
            </div>
        </div>
    );
}

export default Interface;