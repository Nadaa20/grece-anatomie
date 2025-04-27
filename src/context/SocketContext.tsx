import React, { createContext} from 'react';
import { io, Socket } from 'socket.io-client';

const URL = 'http://localhost:3000';
const socket = io(URL, {
    transports: ['websocket']
});

interface SocketContextType {
    socket: Socket;
}

const SocketContext = createContext<SocketContextType>({ socket });

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}; 

export { SocketContext, SocketProvider };