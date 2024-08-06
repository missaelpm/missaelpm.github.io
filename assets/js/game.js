//****** GAME LOOP ********//

let time = new Date();
let deltaTime = 0;

if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(Init, 1);
} else {
    document.addEventListener("DOMContentLoaded", Init);
}

function Init() {
    time = new Date();
    Start();
    Loop();
}

function Loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    Update();
    requestAnimationFrame(Loop);
}

//****** GAME LOGIC ********//

const sueloY = 22;
let velY = 0;
const impulso = 900;
const gravedad = 2500;

const dinoPosX = 42;
let dinoPosY = sueloY;

let sueloX = 0;
const velEscenario = 1280 / 3;
let gameVel = 1;
let score = 0;

let parado = false;
let saltando = false;

let tiempoHastaObstaculo = 2;
const tiempoObstaculoMin = 0.7;
const tiempoObstaculoMax = 1.8;
const obstaculoPosY = 16;
const obstaculos = [];

let tiempoHastaNube = 0.5;
const tiempoNubeMin = 0.7;
const tiempoNubeMax = 2.7;
const maxNubeY = 270;
const minNubeY = 100;
const nubes = [];
const velNube = 0.5;

let contenedor, dino, textoScore, suelo, gameOver;

function Start() {

    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    document.addEventListener("keydown", HandleKeyDown);
    document.addEventListener("touchstart", HandleTouchStart);
    document.getElementById("restart").addEventListener("click", ReiniciarJuego);
}

function ReiniciarJuego() {
    score = 0;
    gameVel = 1;
    dino.classList.remove("dino-dead");
    obstaculos.forEach(obstaculo => obstaculo.remove());
    obstaculos.length = 0;
    nubes.forEach(nube => nube.remove());
    nubes.length = 0;
    gameOver.style.display = "none";
    parado = false;
    Loop(); // Reanudar el juego
}

function Update() {
    if (parado) return;

    MoverDinosaurio();
    MoverSuelo();
    DecidirCrearObstaculos();
    DecidirCrearNubes();
    MoverObstaculos();
    MoverNubes();
    DetectarColision();

    velY -= gravedad * deltaTime;
}

function HandleKeyDown(ev) {
    if (ev.keyCode === 32) {
        Saltar();
    }
}

function HandleTouchStart(ev) {
    Saltar();
}

function Saltar() {
    if (dinoPosY === sueloY) {
        saltando = true;
        velY = impulso;
        dino.classList.remove("dino-corriendo");
    }
}

function MoverDinosaurio() {
    dinoPosY += velY * deltaTime;
    if (dinoPosY < sueloY) {
        TocarSuelo();
    }
    dino.style.bottom = `${dinoPosY}px`;
}

function TocarSuelo() {
    dinoPosY = sueloY;
    velY = 0;
    if (saltando) {
        dino.classList.add("dino-corriendo");
    }
    saltando = false;
}

function MoverSuelo() {
    sueloX += CalcularDesplazamiento();
    suelo.style.left = `-${sueloX % contenedor.clientWidth}px`;
}

function CalcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;
}

function Estrellarse() {
    dino.classList.add("dino-dead");
    parado = true;
}

function DecidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if (tiempoHastaObstaculo <= 0) {
        CrearObstaculo();
    }
}

function DecidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if (tiempoHastaNube <= 0) {
        CrearNube();
    }
}

function CrearObstaculo() {
    const obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("cactus");
    if (Math.random() > 0.5) obstaculo.classList.add("cactus2");
    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = `${contenedor.clientWidth}px`;

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin) / gameVel;
}

function CrearNube() {
    const nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth;
    nube.style.left = `${contenedor.clientWidth}px`;
    nube.style.bottom = `${minNubeY + Math.random() * (maxNubeY - minNubeY)}px`;

    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax - tiempoNubeMin) / gameVel;
}

function MoverObstaculos() {
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        if (obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            GanarPuntos();
        } else {
            obstaculos[i].posX -= CalcularDesplazamiento();
            obstaculos[i].style.left = `${obstaculos[i].posX}px`;
        }
    }
}

function MoverNubes() {
    for (let i = nubes.length - 1; i >= 0; i--) {
        if (nubes[i].posX < -nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i, 1);
        } else {
            nubes[i].posX -= CalcularDesplazamiento() * velNube;
            nubes[i].style.left = `${nubes[i].posX}px`;
        }
    }
}

function GanarPuntos() {
    score++;
    textoScore.innerText = score;
    if (score === 5) {
        gameVel = 1.5;
        contenedor.classList.add("mediodia");
    } else if (score === 12) {
        gameVel = 2;
        contenedor.classList.add("tarde");
    } else if (score === 20) {
        gameVel = 3;
        contenedor.classList.add("noche");
    }
    suelo.style.animationDuration = `${3 / gameVel}s`;
}

function GameOver() {
    gameOver.style.display = "block";
    Estrellarse();
}

function DetectarColision() {
    for (let i = 0; i < obstaculos.length; i++) {
        if (obstaculos[i].posX > dinoPosX + dino.clientWidth) {
            break; // al estar en orden, no puede chocar con más
        } else {
            if (IsCollision(dino, obstaculos[i], 10, 30, 15, 20)) {
                GameOver();
            }
        }
    }
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();

    return !(
        (aRect.top + aRect.height - paddingBottom < bRect.top) ||
        (aRect.top + paddingTop > bRect.top + bRect.height) ||
        (aRect.left + aRect.width - paddingRight < bRect.left) ||
        (aRect.left + paddingLeft > bRect.left + bRect.width)
    );
}
