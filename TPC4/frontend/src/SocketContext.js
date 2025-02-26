import React, {createContext, useContext, useState} from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({children}) => {
    const [socket, setSocket] = useState(null);

    const connectSocket = (username) => {
        const newSocket = io('http://localhost:8000', {
            query: {username: username}
        });

        setSocket(newSocket);

        newSocket.on('disconnect', () => {
            setSocket(null);
            newSocket.disconnect();
        });
        socket.on('connect_error', function(){
            setSocket(null);
            newSocket.disconnect();
        });
    };

    return (
        <SocketContext.Provider value={{socket, connectSocket}}>
            {children}
        </SocketContext.Provider>
    );
};
