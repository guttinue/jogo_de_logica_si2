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


// Novas perguntas focadas em proposições lógicas e tabelas verdade
const questions = [
    { q: "Qual é o valor lógico de 'V ∧ F'?", a: "Falso" },
    { q: "Qual é o valor lógico de 'V ∨ F'?", a: "Verdadeiro" },
    { q: "O que resulta da negação de 'Verdadeiro'?", a: "Falso" },
    { q: "Complete: 'A ⇒ B' é falso apenas quando A é __ e B é __.", a: "Verdadeiro Falso" },
    { q: "Qual é a tabela verdade da bicondicional 'A ⇔ B' quando A é F e B é F?", a: "Verdadeiro" },
    { q: "Se '¬A ∨ B' é verdadeiro, e A é verdadeiro, qual é o valor de B?", a: "Verdadeiro" },
    { q: "Qual é o resultado de '¬(A ∧ B)' em termos de '¬A' e '¬B'?", a: "¬A ∨ ¬B" },
    { q: "Quantas linhas tem a tabela verdade de uma proposição com 3 variáveis?", a: "8" },
    { q: "A negação de 'A ⇒ B' é logicamente equivalente a qual expressão?", a: "A ∧ ¬B" },
    { q: "Se a tabela verdade de uma proposição tem todas as entradas verdadeiras, como ela é chamada?", a: "Tautologia" }
];

document.addEventListener('keydown', directionEvent);
submitAnswer.addEventListener('click', submitQuizAnswer);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
saveScoreButton.addEventListener('click', saveHighScore);

function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none'; // Garantir que a tela de game over esteja oculta
    canvas.style.display = 'block';
    initGame();
    game = setInterval(draw, 100);
}

function initGame() {
    snake = [];
    snake[0] = { x: 9 * box, y: 9 * box };
    direction = 'RIGHT'; // Definir a direção inicial
    generateFood();
    score = 0;
    quizCount = 0;
    canvas.style.display = 'block'; // Garantir que o canvas esteja visível
}

function restartGame() {
    playerNameInput.value = '';
    saveScoreButton.disabled = false; // Habilitar o botão de salvar pontuação
    startGame(); // Reiniciar o jogo
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
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
    // Garantir que a comida não apareça em cima da cobra
    for (let i = 0; i < snake.length; i++) {
        if (food.x === snake[i].x && food.y === snake[i].y) {
            generateFood();
            break;
        }
    }
}

function draw() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar a cobra
    for(let i = 0; i < snake.length; i++){
        ctx.fillStyle = (i === 0) ? "green" : "lightgreen";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "#111";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Desenhar a comida
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if( direction === 'LEFT') snakeX -= box;
    if( direction === 'UP') snakeY -= box;
    if( direction === 'RIGHT') snakeX += box;
    if( direction === 'DOWN') snakeY += box;

    // Teletransporte nas bordas
    if(snakeX < 0) snakeX = canvas.width - box;
    else if(snakeX >= canvas.width) snakeX = 0;
    if(snakeY < 0) snakeY = canvas.height - box;
    else if(snakeY >= canvas.height) snakeY = 0;

    let newHead = { x: snakeX, y: snakeY };

    // Verificar colisão com o corpo
    if(collision(newHead, snake)){
        endGame();
        return;
    }

    snake.unshift(newHead);

    if(snakeX === food.x && snakeY === food.y){
        quizCount++;
        if (quizCount <= 10) {
            openQuizModal(quizCount - 1);
        } else {
            endGame();
        }
        generateFood();
    } else {
        snake.pop();
    }
}

function openQuizModal(index) {
    clearInterval(game);
    questionElem.textContent = questions[index].q;
    answerInput.value = ''; // Limpar o campo de resposta
    quizModal.style.display = 'block';
}

function submitQuizAnswer() {
    let userAnswer = answerInput.value.trim().toLowerCase();
    let correctAnswer = questions[quizCount - 1].a.toLowerCase();

    if(userAnswer === correctAnswer){
        score++;
        // Adicionar um novo segmento à cobra
        snake.push({});
    } else {
        // Remover um segmento da cobra
        if (snake.length > 1) {
            snake.pop();
        } else {
            // Se a cobra só tem um segmento, o jogo termina
            endGame();
            return;
        }
    }

    answerInput.value = '';
    quizModal.style.display = 'none';
    game = setInterval(draw, 100);
}

function endGame() {
    clearInterval(game);
    canvas.style.display = 'none';
    finalScoreElem.textContent = score;
    loadHighScores();
    displayHighScores();
    gameOverScreen.style.display = 'block';
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

// Impede que o botão seja clicado mais de uma vez
playerNameInput.addEventListener('input', () => {
    saveScoreButton.disabled = false;
});

