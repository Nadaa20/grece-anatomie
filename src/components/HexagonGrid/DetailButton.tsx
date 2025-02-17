import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { useRef, useState } from 'react'

interface DetailButtonProps {
    position: [number, number, number]
    onClick: () => void
}

export const DetailButton: React.FC<DetailButtonProps> = ({ position, onClick }) => {
    const [hovered, setHovered] = useState(false)
    const meshRef = useRef<THREE.Mesh>(null)

    // Texture procédurale pour le bois
    const woodTexture = new THREE.TextureLoader().load('/textures/wood.jpg')

    return (
        <group position={position}>
            {/* Bâton de support */}
            <mesh position={[0, -0.6, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
                <meshStandardMaterial
                    map={woodTexture}
                    roughness={0.8}
                    metalness={0.1}
                    color="#8b4513"
                />
            </mesh>

            <Billboard
                position={[0, 0, 0]}
                follow={true}
                lockX={false}
                lockY={false}
                lockZ={false}
            >
                <group
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                    onClick={onClick}
                    scale={hovered ? 1.1 : 1}
                >
                    {/* Panneau en bois */}
                    <mesh
                        ref={meshRef}
                    >
                        <boxGeometry args={[1.5, 0.6, 0.08]} />
                        <meshStandardMaterial
                            map={woodTexture}
                            roughness={0.8}
                            metalness={0.1}
                            color={hovered ? '#d4a66a' : '#ba8c53'}
                        />
                    </mesh>

                    {/* Texte "Détail" */}
                    <Text
                        position={[0, 0, 0.05]}
                        fontSize={0.3}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        font="/fonts/Inter-Bold.woff"
                    >
                        Détail
                    </Text>
                </group>
            </Billboard>
        </group>
    )
} 