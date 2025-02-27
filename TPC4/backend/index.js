import {Server} from 'socket.io';
import {generateGame} from "./generateGame.js";

const io = new Server({
    cors: {
        origin: '*'
    }
});

const questionsPerGame = 10;
const endpoint = 'http://localhost:7200/repositories/historia';
const prefix = 'http://www.semanticweb.org/andre/ontologies/2015/6/historia#'

let questions = null;
let gameActive = false;
let players = {};
let currentQuestion = 0;
let answeredPlayers = 0;
let questionTimer = null;

function nextQuestion() {
    io.emit("end_question");

    setTimeout(() => {
        answeredPlayers = 0;

        if (currentQuestion < Object.keys(questions).length) {
            currentQuestion++;
            io.emit("question", questions[currentQuestion]);
            questionTimer = setTimeout(() => {
                nextQuestion();
            }, 30000);
        } else {
            gameActive = false;
            io.emit("game_over", players);
            Object.keys(players).forEach(key => players[key].score = 0);
            currentQuestion = 0;
        }
    }, 5000);
}

io.on("connection", (socket) => {
    if (gameActive) {
        socket.disconnect();
        return;
    }

    players[socket.id] = {score: 0, username: socket.handshake.query.username};

    console.log(`Player ${socket.id} (${players[socket.id].username}) connected`);
    io.emit("players", players);

    socket.on("start_game", async () => {
        if (!gameActive) {
            gameActive = true;
            const questionsData = await generateGame(questionsPerGame, endpoint, prefix);
            questions = questionsData.reduce((acc, curr, index) => {
                acc[index + 1] = curr;
                return acc;
            }, {});
            nextQuestion();
        }
    });

    socket.on("answer", (answer) => {
        players[socket.id].score += answer === questions[currentQuestion].answer ? 1 : 0;
        answeredPlayers++;
        if (answeredPlayers === Object.keys(players).length) {
            answeredPlayers = 0;
            clearTimeout(questionTimer);
            nextQuestion();
        }
    });

    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit("players", players);
    });
});

const port = 8000;
console.log(`Server starting on port ${port}`);
io.listen(port);
