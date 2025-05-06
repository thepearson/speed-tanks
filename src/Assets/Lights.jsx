import React from 'react';

function Lights(props) {
    return (
        <>
            <directionalLight castShadow position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
            <ambientLight intensity={ 2 } />
        </>
    );
}

export default Lights;