import React, {useEffect, useState} from "react";
import {useSocket} from "./SocketContext.js";

function Game() {
    const [players, setPlayers] = useState({});
    const [question, setQuestion] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [leaderBoard, setLeaderBoard] = useState(null);
    const {socket} = useSocket();

    useEffect(() => {
        const handlePlayers = (p) => {
            console.log("players", p);
            setPlayers(p);
        };

        const handleGameOver = (lb) => {
            console.log("game_over", lb);
            setQuestion(null);
            setAnswered(false);
            setQuestionCount(0);
            setLeaderBoard(lb);
        };

        const handleQuestion = (q) => {
            console.log("question", q);
            setQuestion(q);
            setAnswered(false);
            setQuestionCount((q) => q + 1);
            setLeaderBoard(null);
        };

        socket.on("players", handlePlayers);
        socket.on("game_over", handleGameOver);
        socket.on("question", handleQuestion);

        return () => {
            socket.off("players", handlePlayers);
            socket.off("game_over", handleGameOver);
            socket.off("question", handleQuestion);
        };
    }, [socket]);

    if (leaderBoard !== null) {
        return (<div>
            <p>Leaderboard</p>
            <ul>
                {Object.entries(leaderBoard).map(([player, info]) => (<li key={player}>{info.username} - {info.score}</li>))}
            </ul>
            <button onClick={() => {
                setLeaderBoard(null);
            }}>Continue</button>
        </div>);
    }

    if (question !== null) {
        return (<div>
            <p>Question {questionCount}</p>
            <p>{question.question}</p>
            <div>
                {question.options.map(option => (
                    <button disabled={answered} key={option} onClick={() => {
                        socket.emit("answer", option);
                        setAnswered(true);
                    }}>{option}{answered && option === question.answer ? (<> - Right One</>) : (<></>)}</button>
                ))}
            </div>
        </div>);
    }

    return (<div>
        <p>Players {Object.keys(players).length}</p>
        <ul>
            {Object.entries(players).map(([player, info]) => (<li key={player}>{info.username}</li>))}
        </ul>
        <button onClick={() => {
            socket.emit("start_game");
        }}>Start</button>
    </div>)
}

export default Game;
