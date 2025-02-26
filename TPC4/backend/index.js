import {Server} from 'socket.io';

const io = new Server({
    cors: {
        origin: '*'
    }
});

const questions = {
    1: {question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4"},
    2: {question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Lisbon"], answer: "Paris"},
    3: {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        answer: "Mars"
    },
    4: {question: "What is the chemical symbol for water?", options: ["O2", "CO2", "H2O", "H2"], answer: "H2O"},
    5: {question: "How many continents are there on Earth?", options: ["5", "6", "7", "8"], answer: "5"}
};

let gameActive = false;
let players = {};
let currentQuestion = 0;
let answeredPlayers = 0;
let questionTimer = null;

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

    socket.on("start_game", () => {
        gameActive = true;
        nextQuestion();
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
