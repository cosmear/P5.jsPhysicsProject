let clavijas = [];
let numFilas = 8;
let numClavijasEnFila = [3, 4, 5, 6, 7, 8, 9, 10];
let ranuras = [];
let numRanuras = 12;
let pelotaDir = -1;
let rotatingBall = {angle: 0, radius: 140, speed: 0.05, color: [255, 0, 0]};
let rotatingBallMCUV = {angle: 0, radius: 200, speed: 0.05, color: [255, 0, 0]};

var Inicio = {x: 0, y: 0, r: 60};
var Reinicio = {x: 0, y: 0, h: 30, w: 60};
var Ganaste = {x: 0, y: 0, r: 160}; 
var jugar = {x: 540, y: 0, h: 30, w: 60};
var Rect1 = {x: 50, y: 500, w: 50, h: 30, vel: 2, d: 1, c: 0};
var Rect2 = {x: 0, y: 500, w: 50, h: 30, vel: 2, d: 1, c: 0};
var pelotaInicial = {x: 300, y: 60, r: 30}; 
var pelota = null; 

let gameState = "start";
let bolaSoltada = false;
let colisionConRanura = false;
let puntajesPorRanura = [-1, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, -1];

let velY = 0; 
let velX = 1;
let velXIni = 1;
let aceleracion = 0.01;
let dt;

let puntaje = 0;
let cooldown = false;

let startTime, endTime; 

function setup() {
  createCanvas(600, 600);
  Inicio.x = width / 2;
  Inicio.y = height / 2;
  Ganaste.x = width / 2;
  Ganaste.y = height / 2;
  Rect2.x = width - 100;
  Rect2.c = color(0, 0, 255);
  Rect1.c = color(255, 0, 0);
  textAlign(CENTER, CENTER);

  let espacioEntreCirculos = 50;
  let altoTriangulo = numFilas * espacioEntreCirculos;
  let yOffsetInicial = (height - altoTriangulo) / 2;

  for (let fila = 0; fila < numFilas; fila++) {
    let yOffset = yOffsetInicial + fila * espacioEntreCirculos;
    let numClavijas = numClavijasEnFila[fila];
    let xOffsetInicial = (width + 45 - numClavijas * espacioEntreCirculos) / 2;

    for (let i = 0; i < numClavijas; i++) {
      clavijas.push(createVector(xOffsetInicial + i * espacioEntreCirculos, yOffset));
    }
  }

  let espacioEntreRanuras = 0;
  let primeraRanuraX = (width - (numRanuras * 49.2 + (numRanuras - 1) * espacioEntreRanuras)) / 2;

  for (let i = 0; i < numRanuras; i++) {
    ranuras.push(createVector(primeraRanuraX + i * (50 + espacioEntreRanuras), height - 20));
  }

  pelotaInicial.x = random(50, width - 50);
  pelotaInicial.y = 50;
}

function draw() {
  if (gameState === "win") {
    drawWinScreen();
    return; 
  }

  background(220);
  let Punto = {
    x: mouseX,
    y: mouseY
  };

  strokeWeight(18);
  stroke(255, 204, 0);
  point(Punto.x, Punto.y);
  noStroke();

  if (gameState === "start") {
    fill(255, 0, 0);
    circle(Inicio.x, Inicio.y, Inicio.r);

    fill(0);
    textSize(20);
    text("Iniciar", Inicio.x, Inicio.y);
    text("El objetivo es llegar a 15 puntos o más", Inicio.x,Inicio.y +40)

    let d = dist(Punto.x, Punto.y, Inicio.x, Inicio.y);
    if (d < Inicio.r / 2) {
      gameState = "play";
      startTime = millis(); 
    }
  }

  if (gameState === "play") {
    fill(255, 204, 0);
    rect(Reinicio.x, Reinicio.y, Reinicio.w, Reinicio.h);
    fill(0);
    textSize(14);
    text("Reiniciar", Reinicio.x + 29, Reinicio.y + 15);

    if (puntaje >= 15) {
      gameState = "win";
      endTime = millis(); 
    }

    if (Punto.x >= Reinicio.x && Punto.x <= Reinicio.x + Reinicio.w && Punto.y >= Reinicio.y && Punto.y <= Reinicio.y + Reinicio.h) {
      gameState = "start";
      puntaje = 0;
      pelota = null; 
      bolaSoltada = false;
    }

    fill(255, 204, 0);
    rect(jugar.x, jugar.y, jugar.w, jugar.h);
    fill(0);
    textSize(14);
    text("Jugar", jugar.x + 30, jugar.y + 15);

    if (Punto.x >= jugar.x && Punto.x <= jugar.x + jugar.w && Punto.y >= jugar.y && Punto.y <= jugar.y + jugar.h) {
      if (!bolaSoltada && !cooldown && pelota === null) {
        bolaSoltada = true;
        cooldown = true;
        colisionConRanura = true;
        pelota = {x: pelotaInicial.x, y: pelotaInicial.y, r: 20}; 
        velY = 0; 
        setTimeout(() => {
          cooldown = false;
        }, 0);
      }
    }

    fill(Rect1.c);
    rect(Rect1.x, Rect1.y, Rect1.w, Rect1.h);
    fill(Rect2.c);
    rect(Rect2.x, Rect2.y, Rect2.w, Rect2.h);

    fill(255, 0, 0); 
    circle(pelotaInicial.x, pelotaInicial.y, pelotaInicial.r);

    if (pelotaInicial.x + pelotaInicial.r / 2 >= width) {
      pelotaDir = -1; 
    } else if (pelotaInicial.x - pelotaInicial.r / 2 <= 0) {
      pelotaDir = 1; 
    }

    pelotaInicial.x += pelotaDir;

    if (pelota !== null) {
      fill(0, 0, 255); 
      movePelota();
      circle(pelota.x, pelota.y, pelota.r);
    }

    moveRect(Rect1);
    moveRect(Rect2);
    checkRectCollision(Rect1, Rect2);
    dt = deltaTime / 1000;

    fill(100);
    for (let i = 0; i < clavijas.length; i++) {
      circle(clavijas[i].x, clavijas[i].y, 20);
    }

    fill(200);
    for (let i = 0; i < ranuras.length; i++) {
      rect(ranuras[i].x, ranuras[i].y, 40, 40);
    }

    if (pelota !== null) {
      checkCollisions();
    }

    if (pelota !== null && pelota.y > height) {
      colisionConRanura = false;
      pelota = null; // Resetea la pelota
      bolaSoltada = false;
    }

    fill(0);
    textAlign(CENTER);
    textSize(18);
    text("Puntaje: " + puntaje, width / 2, 20);

    fill(0);
    textAlign(CENTER);
    textSize(18);
    text("Pone tu mouse en el boton jugar", width / 2, 50);
  }
}

function drawWinScreen() {
 background(200); 
  fill(0, 255, 0);
  circle(Ganaste.x, Ganaste.y, Ganaste.r);
  fill(0);
  textSize(20);
  text("¡¡Ganaste!!", Ganaste.x, Ganaste.y -10);
  
  textSize(18);
  text("Puntaje: " + puntaje, Ganaste.x, Ganaste.y + 25);
  
  let totalTime = (endTime - startTime) / 60000;
  textSize(18);
  text("Tiempo: " + totalTime.toFixed(2) + " minutos", Ganaste.x, Ganaste.y + 250);
  
  
  rotatingBall.angle += rotatingBall.speed;
  let MCUx = Ganaste.x + rotatingBall.radius * cos(rotatingBall.angle);
  let MCUy = Ganaste.y + rotatingBall.radius * sin(rotatingBall.angle);

  
  rotatingBall.color = [random(255), random(255), random(255)];

  
  fill(rotatingBall.color);
  circle(MCUx, MCUy, 30);
  
  
  rotatingBallMCUV.speed += aceleracion * dt;
  rotatingBallMCUV.angle += rotatingBallMCUV.speed;
  
  let MCUVx = Ganaste.x + rotatingBallMCUV.radius * cos(rotatingBallMCUV.angle);
  let MCUVy = Ganaste.y + rotatingBallMCUV.radius * sin(rotatingBallMCUV.angle);
  
  fill(rotatingBallMCUV.color);
  circle(MCUVx, MCUVy, 30);

  
  fill(255, 204, 0);
  rect(Reinicio.x, Reinicio.y, Reinicio.w, Reinicio.h);
  fill(0);
  textSize(14);
  text("Reiniciar", Reinicio.x + 29, Reinicio.y + 15);

  let Punto = {
    x: mouseX,
    y: mouseY
  };

  if (Punto.x >= Reinicio.x && Punto.x <= Reinicio.x + Reinicio.w && Punto.y >= Reinicio.y && Punto.y <= Reinicio.y + Reinicio.h) {
    gameState = "start";
    puntaje = 0;
    pelota = null; // Resetea la pelota
    bolaSoltada = false;
  }
}

function movePelota() {
  if (bolaSoltada && pelota !== null) {
    let aceleracion = 1;
    velY += aceleracion * dt; // Añade aceleración con el tiempo

    pelota.y += velY;
    pelota.x = constrain(pelota.x, 0, width);
  }
}

function checkCollisions() {
  if (pelota === null) return;

  let colisionDetectada = false;

  for (let i = 0; i < clavijas.length; i++) {
    let distanciaX = abs(pelota.x - clavijas[i].x);
    let distanciaY = abs(pelota.y - clavijas[i].y);
    let distanciaCentros = sqrt(sq(distanciaX) + sq(distanciaY));

    if (distanciaCentros <= pelota.r / 2 + 10) {
      colisionDetectada = true;
      let angulo = atan2(pelota.y - clavijas[i].y, pelota.x - clavijas[i].x);
      pelota.x += cos(angulo) * 2;
      pelota.y += sin(angulo) * 2;
      velX *= -1;
      break;
    }
  }

  if (pelota !== null && pelota.y + pelota.r / 2 >= Rect1.y && pelota.x >= Rect1.x && pelota.x <= Rect1.x + Rect1.w) {
    puntaje -= 3;
    pelota = null; 
    bolaSoltada = false;
  }

  if (pelota !== null && pelota.y + pelota.r / 2 >= Rect2.y && pelota.x >= Rect2.x && pelota.x <= Rect2.x + Rect2.w) {
    puntaje -= 3;
    pelota = null; 
    bolaSoltada = false;
  }

  if (colisionDetectada) {
    return;
  }

  for (let i = 0; i < ranuras.length; i++) {
    if (pelota !== null && pelota.y + pelota.r / 2 >= ranuras[i].y && pelota.x >= ranuras[i].x && pelota.x <= ranuras[i].x + 60) {
      if (pelota.y >= ranuras[i].y && pelota.y <= ranuras[i].y + 20) {
        puntaje += puntajesPorRanura[i];
        colisionConRanura = true;
        pelota = null; 
        bolaSoltada = false;
        break;
      }
    }
  }

  if (pelota !== null && pelota.y >= height && !colisionConRanura) {
    pelota = null; 
    bolaSoltada = false;
  }
}

function checkRectCollision(rect1, rect2) {
  if (rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x &&
      rect1.y < rect2.y + rect2.h && rect1.y + rect2.h > rect2.y) {
    rect1.c = color(random(255), random(255), random(255));
    rect2.c = color(random(255), random(255), random(255));
    rect1.d *= -1;
    rect2.d *= -1;
  }

  if (rect1.x <= 0) {
    rect1.d = 1;
    rect1.c = color(random(255), random(255), random(255));
  }

  if (rect2.x + rect1.w >= width) {
    rect2.d = -1;
    rect2.c = color(random(255), random(255), random(255));
  }
}

function moveRect(rect) {
  rect.x += rect.vel * rect.d;
}

