const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
let snake = [];
let direction = null;
let food = {};
let score = 0;
let quizCount = 0;
let game;
let highScores = [];
let growSnake = false; 

const quizModal = document.getElementById('quizModal');
const questionElem = document.getElementById('question');
const answerInput = document.getElementById('answer');
const submitAnswer = document.getElementById('submitAnswer');

const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElem = document.getElementById('finalScore');
const playerNameInput = document.getElementById('playerName');
const saveScoreButton = document.getElementById('saveScoreButton');
const restartButton = document.getElementById('restartButton');
const highScoresList = document.getElementById('highScoresList');

const winScreen = document.getElementById('winScreen');
const restartButtonWin = document.getElementById('restartButtonWin');

const questions = [
    { q: "Qual é o valor lógico de 'V ∧ F'?", a: "falso" },
    { q: "Qual é o valor lógico de 'V ∨ F'?", a: "verdadeiro" },
    { q: "O que resulta da negação de 'Verdadeiro'?", a: "falso" },
    { q: "Complete: 'A ⇒ B' é falso apenas quando A é __ e B é __.", a: "verdadeiro falso" },
    { q: "Qual é o valor de 'A ⇔ B' quando A é F e B é F?", a: "verdadeiro" },
    { q: "Se '¬A ∨ B' é verdadeiro, e A é verdadeiro, qual é o valor de B?", a: "verdadeiro" },
    { q: "Qual é o resultado de '¬(A ∧ B)' em termos de '¬A' e '¬B'?", a: "~a ∨ ~b" },
    { q: "Quantas linhas tem a tabela verdade de uma proposição com 3 variáveis?", a: "8" },
    { q: "A negação de 'A ⇒ B' é equivalente a qual expressão?", a: "a ^ ~b" },
    { q: "Se a tabela verdade de uma proposição tem todas as entradas verdadeiras, como ela é chamada?", a: "tautologia" }
];

document.addEventListener('keydown', directionEvent);
submitAnswer.addEventListener('click', submitQuizAnswer);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
restartButtonWin.addEventListener('click', restartGame);
saveScoreButton.addEventListener('click', saveHighScore);

const instructionsButton = document.getElementById('instructionsButton');
const instructionsModal = document.getElementById('instructionsModal');
const closeInstructions = document.getElementById('closeInstructions');

instructionsButton.addEventListener('click', () => {
    instructionsModal.style.display = 'block';
});

closeInstructions.addEventListener('click', () => {
    instructionsModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === instructionsModal) {
        instructionsModal.style.display = 'none';
    }
});

function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    winScreen.style.display = 'none';
    canvas.style.display = 'block';
    initGame();
    game = setInterval(draw, 100);
}

function initGame() {
    snake = [];
    snake[0] = { x: 9 * box, y: 9 * box };
    direction = 'RIGHT'; 
    generateFood();
    score = 0;
    quizCount = 0;
    growSnake = false;
}

function restartGame() {
    playerNameInput.value = '';
    saveScoreButton.disabled = false;
    startGame();
}

function directionEvent(event) {
    const key = event.key.toLowerCase();
    if (key === 'w' && direction !== 'DOWN') {
        direction = 'UP';
    } else if (key === 'a' && direction !== 'RIGHT') {
        direction = 'LEFT';
    } else if (key === 's' && direction !== 'UP') {
        direction = 'DOWN';
    } else if (key === 'd' && direction !== 'LEFT') {
        direction = 'RIGHT';
    }
}

function collision(head, array) {
    for (let i = 1; i < array.length; i++) { 
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

function draw() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(let i = 0; i < snake.length; i++){
        ctx.fillStyle = (i === 0) ? "green" : "lightgreen";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "#111";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if( direction === 'LEFT') snakeX -= box;
    else if( direction === 'UP') snakeY -= box;
    else if( direction === 'RIGHT') snakeX += box;
    else if( direction === 'DOWN') snakeY += box;

    if(snakeX < 0) snakeX = canvas.width - box;
    else if(snakeX >= canvas.width) snakeX = 0;
    if(snakeY < 0) snakeY = canvas.height - box;
    else if(snakeY >= canvas.height) snakeY = 0;

    let newHead = { x: snakeX, y: snakeY };

    if(collision(newHead, snake)){
        endGame();
        return;
    }

    snake.unshift(newHead);

    if(snakeX === food.x && snakeY === food.y){
        quizCount++;
        if (quizCount <= 10) {
            openQuizModal(quizCount - 1);
            return; 
        } else {
            winGame();
            return;
        }
    }

    if (!growSnake) {
        if (snake.length > 1) {
            snake.pop();
        }
    } else {
        growSnake = false; 
    }
}

function openQuizModal(index) {
    clearInterval(game);
    questionElem.textContent = questions[index].q;
    answerInput.value = '';
    quizModal.style.display = 'block';
}

function submitQuizAnswer() {
    let userAnswer = answerInput.value.trim().toLowerCase();
    let correctAnswer = questions[quizCount - 1].a.toLowerCase();

    if(userAnswer === correctAnswer){
        score++;
        growSnake = true; 
    } else {
        if (snake.length > 1) {
            snake.pop();
        } else {
            endGame();
            return;
        }
    }

    generateFood(); 
    answerInput.value = '';
    quizModal.style.display = 'none';

    if(score >= 10) {
        winGame();
    } else {
        game = setInterval(draw, 100);
    }
}

function endGame() {
    clearInterval(game);
    canvas.style.display = 'none';
    finalScoreElem.textContent = score;
    loadHighScores();
    displayHighScores();
    gameOverScreen.style.display = 'block';
}

function winGame() {
    clearInterval(game);
    canvas.style.display = 'none';
    winScreen.style.display = 'block';
}

function saveHighScore() {
    let playerName = playerNameInput.value.trim();
    if(playerName === '') {
        alert("Por favor, insira seu nome.");
        return;
    }
    highScores.push({ name: playerName, score: score });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 5);
    localStorage.setItem('highScores', JSON.stringify(highScores));
    displayHighScores();
    playerNameInput.value = '';
    saveScoreButton.disabled = true;
}

function loadHighScores() {
    const storedScores = localStorage.getItem('highScores');
    if(storedScores) {
        highScores = JSON.parse(storedScores);
    }
}

function displayHighScores() {
    highScoresList.innerHTML = '';
    highScores.forEach(score => {
        const li = document.createElement('li');
        li.textContent = `${score.name} - ${score.score}`;
        highScoresList.appendChild(li);
    });
}

playerNameInput.addEventListener('input', () => {
    saveScoreButton.disabled = false;
});
