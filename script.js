// script.js

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const pontuacaoElem = document.querySelector(".pontuacao--valor");
const pontuacaoFinalElem = document.querySelector(".pontuacao-final > span");
const menuTela = document.querySelector(".menu-tela");
const botaoJogar = document.querySelector(".btn-jogar");
const botaoInstrucoes = document.querySelector(".btn-instrucoes");

const modalInstrucoes = document.getElementById("instrucoesModal");
const fecharInstrucoes = document.getElementById("fecharInstrucoes");

const quizModal = document.getElementById("quizModal");
const perguntaElem = document.getElementById("pergunta");
const respostaInput = document.getElementById("resposta");
const enviarResposta = document.getElementById("enviarResposta");

const telaGameOver = document.getElementById("telaGameOver");
const mensagemGameOverElem = document.getElementById("mensagemGameOver");
const pontuacaoFinalModalElem = document.getElementById("pontuacaoFinal");
const nomeJogadorInput = document.getElementById("nomeJogador");
const salvarPontuacaoBtn = document.getElementById("salvarPontuacaoBtn");
const botaoRecomecar = document.querySelector(".btn-recomecar");
const listaPontuacoes = document.getElementById("listaPontuacoes");

const tamanho = 30;
const posicaoInicial = { x: 270, y: 240 };
let cobra;
let direcao;
let idLoop;
let pontuacao;
let contadorQuiz;
let pontuacoesAltas = [];
let pausado;

const perguntas = [
    { q: "Qual é o valor lógico de 'V ∧ F'?", a: "f" },
    { q: "Qual é o valor lógico de 'V ∨ F'?", a: "v" },
    { q: "O que resulta da negação de 'Verdadeiro'?", a: "falso" },
    { q: "Complete: 'A ⇒ B' é falso apenas quando A é __ e B é __.", a: "v f" },
    { q: "Qual é o valor de 'A ⇔ B' quando A é F e B é F?", a: "v" },
    { q: "Se '¬A ∨ B' é verdadeiro, e A é verdadeiro, qual é o valor de B?", a: "v" },
    { q: "Qual é o resultado de '¬(A ∧ B)' em termos de '¬A' e '¬B'?", a: "¬a ∨ ¬b" },
    { q: "Quantas linhas tem a tabela verdade de uma proposição com 3 variáveis?", a: "8" },
    { q: "A negação de 'A ⇒ B' é equivalente a qual expressão?", a: "a ∧ ¬b" },
    { q: "Se a tabela verdade de uma proposição tem todas as entradas verdadeiras, como ela é chamada?", a: "tautologia" }
];

let comida = {};

function numeroAleatorio(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function posicaoAleatoria() {
    const numero = numeroAleatorio(0, canvas.width - tamanho);
    return Math.round(numero / tamanho) * tamanho;
}

function corAleatoria() {
    const red = numeroAleatorio(0, 255);
    const green = numeroAleatorio(0, 255);
    const blue = numeroAleatorio(0, 255);
    return `rgb(${red}, ${green}, ${blue})`;
}

function iniciarJogo() {
    pontuacao = 0;
    pontuacaoElem.innerText = "00";
    pontuacaoFinalElem.innerText = "00";
    menuTela.classList.add("escondido");
    telaGameOver.style.display = "none";
    modalInstrucoes.style.display = "none";
    quizModal.style.display = "none";
    cobra = [{ ...posicaoInicial }];
    direcao = "direita"; // Definir direção inicial
    contadorQuiz = 0;
    pausado = false;
    gerarComida();
    loopJogo();
}

function desenharComida() {
    const { x, y, color } = comida;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, tamanho, tamanho);
    ctx.shadowBlur = 0;
}

function desenharCobra() {
    ctx.fillStyle = "#ddd";
    cobra.forEach((posicao, index) => {
        if (index === cobra.length - 1) {
            ctx.fillStyle = "white";
        }
        ctx.fillRect(posicao.x, posicao.y, tamanho, tamanho);
    });
}

function moverCobra() {
    if (!direcao || pausado) return;

    const cabeca = cobra[cobra.length - 1];
    let novaCabeca;

    if (direcao === "direita") novaCabeca = { x: cabeca.x + tamanho, y: cabeca.y };
    if (direcao === "esquerda") novaCabeca = { x: cabeca.x - tamanho, y: cabeca.y };
    if (direcao === "baixo") novaCabeca = { x: cabeca.x, y: cabeca.y + tamanho };
    if (direcao === "cima") novaCabeca = { x: cabeca.x, y: cabeca.y - tamanho };

    cobra.push(novaCabeca);
    cobra.shift();
}

function desenharGrade() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#191919";
    for (let i = tamanho; i < canvas.width; i += tamanho) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function incrementarPontuacao() {
    pontuacao += 10;
    pontuacaoElem.innerText = pontuacao < 10 ? `0${pontuacao}` : pontuacao;
}

function verificarComer() {
    const cabeca = cobra[cobra.length - 1];
    if (cabeca.x === comida.x && cabeca.y === comida.y) {
        pausado = true;
        abrirQuizModal(contadorQuiz);
    }
}

function gerarComida() {
    let x = posicaoAleatoria();
    let y = posicaoAleatoria();

    while (cobra.some(posicao => posicao.x === x && posicao.y === y)) {
        x = posicaoAleatoria();
        y = posicaoAleatoria();
    }

    comida.x = x;
    comida.y = y;
    comida.color = corAleatoria();
}

function verificarColisao() {
    const cabeca = cobra[cobra.length - 1];
    const limiteCanvas = canvas.width - tamanho;
    const indicePescoco = cobra.length - 2;

    const colisaoParede = cabeca.x < 0 || cabeca.x > limiteCanvas || cabeca.y < 0 || cabeca.y > limiteCanvas;

    const colisaoCorpo = cobra.find((posicao, index) => {
        return index < indicePescoco && posicao.x === cabeca.x && posicao.y === cabeca.y;
    });

    if (colisaoParede || colisaoCorpo) {
        finalizarJogo(false);
    }
}

function finalizarJogo(vitoria) {
    clearTimeout(idLoop);
    direcao = undefined;
    pausado = true;

    mensagemGameOverElem.textContent = vitoria ? "Parabéns! Você completou o jogo!" : "Game Over";
    pontuacaoFinalModalElem.innerText = pontuacao;
    telaGameOver.style.display = "flex";
    carregarPontuacoes();
    exibirPontuacoes();
}

function loopJogo() {
    if (pausado) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharGrade();
    desenharComida();
    moverCobra();
    desenharCobra();
    verificarComer();
    verificarColisao();

    idLoop = setTimeout(loopJogo, 200);
}

function abrirQuizModal(indice) {
    if (indice >= perguntas.length) {
        finalizarJogo(true);
        return;
    }
    perguntaElem.textContent = perguntas[indice].q;
    respostaInput.value = '';
    quizModal.style.display = 'flex';
}

function enviarRespostaQuiz() {
    const respostaUsuario = respostaInput.value.trim().toLowerCase();
    const respostaCorreta = perguntas[contadorQuiz].a.toLowerCase();

    if (respostaUsuario === respostaCorreta) {
        incrementarPontuacao();
        cobra.push({ ...cobra[cobra.length - 1] });
    } else {
        if (cobra.length > 1) {
            cobra.pop();
        } else {
            quizModal.style.display = 'none';
            finalizarJogo(false);
            return;
        }
    }

    contadorQuiz++;
    quizModal.style.display = 'none';
    pausado = false;
    gerarComida();
    loopJogo();
}

function carregarPontuacoes() {
    const pontuacoesArmazenadas = localStorage.getItem('pontuacoesAltas');
    if (pontuacoesArmazenadas) {
        pontuacoesAltas = JSON.parse(pontuacoesArmazenadas);
    }
}

function salvarPontuacao() {
    const nomeJogador = nomeJogadorInput.value.trim();
    if (nomeJogador === '') {
        alert("Por favor, insira seu nome.");
        return;
    }
    pontuacoesAltas.push({ nome: nomeJogador, pontuacao: pontuacao });
    pontuacoesAltas.sort((a, b) => b.pontuacao - a.pontuacao);
    pontuacoesAltas = pontuacoesAltas.slice(0, 5);
    localStorage.setItem('pontuacoesAltas', JSON.stringify(pontuacoesAltas));
    exibirPontuacoes();
    nomeJogadorInput.value = '';
    salvarPontuacaoBtn.disabled = true;
}

function exibirPontuacoes() {
    listaPontuacoes.innerHTML = '';
    pontuacoesAltas.forEach(({ nome, pontuacao }) => {
        const li = document.createElement('li');
        li.textContent = `${nome} - ${pontuacao}`;
        listaPontuacoes.appendChild(li);
    });
}

document.addEventListener("keydown", ({ key }) => {
    if (pausado) return;

    const tecla = key.toLowerCase();

    if ((tecla === "arrowright" || tecla === "d") && direcao !== "esquerda") direcao = "direita";
    if ((tecla === "arrowleft" || tecla === "a") && direcao !== "direita") direcao = "esquerda";
    if ((tecla === "arrowdown" || tecla === "s") && direcao !== "cima") direcao = "baixo";
    if ((tecla === "arrowup" || tecla === "w") && direcao !== "baixo") direcao = "cima";
});

botaoJogar.addEventListener("click", () => {
    iniciarJogo();
});

botaoInstrucoes.addEventListener("click", () => {
    modalInstrucoes.style.display = 'flex';
});

fecharInstrucoes.addEventListener("click", () => {
    modalInstrucoes.style.display = 'none';
});

enviarResposta.addEventListener("click", enviarRespostaQuiz);

salvarPontuacaoBtn.addEventListener("click", salvarPontuacao);

botaoRecomecar.addEventListener("click", () => {
    nomeJogadorInput.value = '';
    salvarPontuacaoBtn.disabled = false;
    telaGameOver.style.display = "none";
    iniciarJogo();
});

nomeJogadorInput.addEventListener('input', () => {
    salvarPontuacaoBtn.disabled = false;
});

// Inicializar o jogo mostrando o menu
menuTela.classList.remove("escondido");
