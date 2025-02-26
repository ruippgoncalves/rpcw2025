import React, {useEffect, useState} from "react";
import {useSocket} from "./SocketContext.js";

function Leaderboard(props) {
    return (<div>
        <p>Leaderboard</p>
        <ul>
            {Object.entries(props.leaderBoard).map(([player, info]) => (
                <li key={player}>{info.username} - {info.score}</li>))}
        </ul>
        <button onClick={props.onContinue}>Continue</button>
    </div>);
}

function UserList(props) {
    return (<div>
        <p>Players {Object.keys(props.players).length}</p>
        <ul>
            {Object.entries(props.players).map(([player, info]) => (<li key={player}>{info.username}</li>))}
        </ul>
        <button onClick={props.onStart}>Start
        </button>
    </div>);
}

function Question(props) {
    if ('options2' in props.question) {
        const [selectedAnswers, setSelectedAnswers] = useState(new Array(props.question.options.length).fill(null));

        return (<div>
            <p>Question {props.questionCount}</p>
            <p>{props.question.question}</p>
            <div>
                {props.question.options.map((option, index) => (
                    <div key={option}>
                        <label>{option}</label>
                        <select
                            onChange={(e) => {
                                const selectedIndex = parseInt(e.target.value);
                                setSelectedAnswers((prevAnswers) => {
                                    const newAnswers = [...prevAnswers];
                                    newAnswers[index] = selectedIndex;
                                    return newAnswers;
                                });
                            }}
                            disabled={props.answered}
                            value={selectedAnswers[index] !== null ? selectedAnswers[index] : ""}
                        >
                            <option value="">Select</option>
                            {props.question.options2.map((option2, idx) => (
                                <option key={idx} value={idx}>
                                    {option2}
                                </option>
                            ))}
                        </select>
                        {props.answered && props.question.answer.split('/')[index] === (selectedAnswers[index] + 1).toString() ? (
                            <span> - Right One</span>
                        ) : null}
                    </div>
                ))}
            </div>
            <button
                onClick={() => {
                    const answerString = selectedAnswers.join('/');
                    props.onAnswer(answerString);
                }}
                disabled={props.answered}
            >
                Submit Answer
            </button>
        </div>);
    }

    return (<div>
        <p>Question {props.questionCount}</p>
        <p>{props.question.question}</p>
        <div>
            {props.question.options.map(option => (
                <button disabled={props.answered} key={option}
                        onClick={() => {
                            props.onAnswer(option)
                        }}>{option}{props.answered && option === props.question.answer ? (<> -
                    Right One</>) : (<></>)}</button>
            ))}
        </div>
    </div>);
}

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
        return (<Leaderboard leaderBoard={leaderBoard} onContinue={() => {
            setLeaderBoard(null);
        }}/>);
    }

    if (question !== null) {
        return (<Question questionCount={questionCount} question={question} answered={answered} onAnswer={(a) => {
            socket.emit("answer", a);
            setAnswered(true);
        }}/>);
    }

    return (<UserList players={players} onStart={() => {
        socket.emit("start_game");
    }}/>);
}

export default Game;
