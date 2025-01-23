import React from 'react';

interface TroopProps {
    position: [number, number, number];
    isSelected: boolean;
    onClick: () => void;
}

const Troop: React.FC<TroopProps> = ({ position, isSelected, onClick }) => {
    return (
        <mesh position={position} onClick={onClick}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial color={isSelected ? 'gold' : 'blue'} />
        </mesh>
    );
};

export default Troop;
