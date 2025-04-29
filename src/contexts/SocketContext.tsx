import React, { createContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const URL = 'http://localhost:3000';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const win = window as Window & { _socketInstance?: Socket };
        
        if (!win._socketInstance) {
            const newSocket = io(URL, { 
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });
            
            newSocket.on('connect', () => {
                console.log('[CLIENT] Socket connecté avec id =', newSocket.id);
                win._socketInstance = newSocket;
                setSocket(newSocket);
            });

            newSocket.on('disconnect', () => {
                console.log('[CLIENT] Socket déconnecté');
            });

            return () => {
                if (newSocket) {
                    console.log('[CLIENT] Fermeture de la socket');
                    newSocket.close();
                    win._socketInstance = undefined;
                }
            };
        } else {
            console.log('[CLIENT] Réutilisation du socket existant, id =', win._socketInstance.id);
            setSocket(win._socketInstance);
        }
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export { SocketContext, SocketProvider };