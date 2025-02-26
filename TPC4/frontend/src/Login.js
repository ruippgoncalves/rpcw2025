import React, { useState } from 'react';
import { useSocket } from './SocketContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const { connectSocket } = useSocket();

    const handleLogin = () => {
        connectSocket(username);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <button disabled={username.length === 0} onClick={handleLogin}>Connect</button>
        </div>
    );
};

export default Login;
