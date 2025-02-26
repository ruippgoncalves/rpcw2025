import React from 'react';
import {SocketProvider, useSocket} from './SocketContext';
import Login from './Login.js';
import Game from "./Game.js";

const AppContent = () => {
    const {socket} = useSocket();

    return (
        <>
            {socket ? (
                <Game/>
            ) : (
                <Login/>
            )}
        </>
    );
};

const App = () => (
    <SocketProvider>
        <AppContent/>
    </SocketProvider>
);

export default App;
