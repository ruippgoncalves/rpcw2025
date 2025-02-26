import {Server} from 'socket.io';

const io = new Server({
    cors: {
        origin: '*'
    }
});

let questions = null;
let gameActive = false;
let players = {};
let currentQuestion = 0;
let answeredPlayers = 0;
let questionTimer = null;

async function generateGame() {
    questions = {
        1: {question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4"},
        2: {question: "Is Paris the capital of France?", options: ["Yes", "No"], answer: "Yes"},
        3: {question: "Connect the chemical symbol to its name?", options: ["O2", "CO2", "H2O", "H2"], options2: ["Hydrogen", "Carbon Dioxide", "Oxygen", "Water"], answer: "2/1/3/0"},
    };
}

function nextQuestion() {
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
            await generateGame();
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
