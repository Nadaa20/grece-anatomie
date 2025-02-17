import { Html } from '@react-three/drei'

interface DetailButtonProps {
    position: [number, number, number]
    onClick: () => void
}

export const DetailButton: React.FC<DetailButtonProps> = ({ position, onClick }) => {
    return (
        <Html position={position} center scale={0.5}>
            <button
                onClick={onClick}
                style={{
                    padding: '6px 12px',
                    backgroundColor: 'rgba(74, 144, 226, 0.9)',
                    color: 'white',
                    border: '2px solid white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    transform: 'scale(1)',
                    transition: 'transform 0.2s',
                    userSelect: 'none',
                    fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                }}
            >
                Détail
            </button>
        </Html>
    )
} 