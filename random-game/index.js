let blockSize = 25;
var rows = cols = 20;
const board = document.querySelector("#board");
const score = document.querySelector(".score");
const final_score = document.querySelector(".final_score");
var context; 

//snake head
var snakeX = blockSize * 5;
var snakeY = blockSize * 5;

var velocityX = 0;
var velocityY = 0;

var snakeBody = [];

var point = 0;
var grd;

//food
var foodX;
var foodY;

var refreshIntervalId;
var gameOver = false;

var levelType = 'low';

const replay = document.querySelector(".replay");
const pause = document.querySelector(".pause");
var status_game = false;

const level_game = document.querySelectorAll(".level_game");

const modal = document.querySelector('.modal');
const closeModal = document.querySelector('.close');

const win = new Audio('./sounds/win.mp3');
const eat = new Audio('./sounds/eat.mp3');

function init() {
    gameOver = false;
    snakeX = blockSize * 5;
    snakeY = blockSize * 5;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    point = 0;
    score.innerHTML = point.toString().padStart(2, "0");

    board.height = rows * blockSize;
    board.width = cols * blockSize;
    context = board.getContext("2d"); 

    placeFood();
    document.addEventListener("keyup", changeDirection);
    refreshIntervalId = setInterval(update, 1000/8); 
    //pause.disabled = true;
    disablePause();
    getResult();
}

window.onload = function() {
    init();
}

function update() {
    if (gameOver) {
        return;
    }

    context.fillStyle = "#181825";
    context.fillRect(0, 0, board.width, board.height);

    drawCells();
    grd = createGrd();

    context.fillStyle = grd;
    context.fillRect(foodX, foodY, blockSize, blockSize);

    if (snakeX == foodX && snakeY == foodY) {
        snakeBody.push([foodX, foodY]);
        eat.play();
        placeFood();
        point++;
        score.innerHTML = point.toString().padStart(2, "0");
    }

    for (let i = snakeBody.length-1; i > 0; i--) {
        snakeBody[i] = snakeBody[i-1];
    }

    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }

    context.fillStyle = grd;
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;
    context.fillRect(snakeX, snakeY, blockSize-1, blockSize-1);

    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize-1, blockSize-1);
    }   

    if (levelType == "hard") {
        hard();    
    } else {
        low();
    }

    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
            gameOverExit();
        }
    }
}

function activePause() {
    pause.disabled = false;
    status_game = true; 
}

function changeDirection(e) {
    if (e.code == "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
        activePause();
    }
    else if (e.code == "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
        activePause();
    }
    else if (e.code == "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
        activePause();
    }
    else if (e.code == "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
        activePause();
    }
}

function placeFood() {
    foodX = Math.floor(Math.random() * cols) * blockSize;
    foodY = Math.floor(Math.random() * rows) * blockSize;
}

function regame() {
    clearInterval(refreshIntervalId);
    init();
}

function drawCells() {
    context.lineWidth = 1.1;
    context.strokeStyle = "#232332";
    context.shadowBlur = 0;
    for (let i = 1; i < cols; i++) {
      let f = (board.width / cols) * i;
      context.beginPath();
      context.moveTo(f, 0);
      context.lineTo(f, board.height);
      context.stroke();
      context.beginPath();
      context.moveTo(0, f);
      context.lineTo(board.width, f);
      context.stroke();
      context.closePath();
    }
}

function disablePause() {
    status_game = false;
    pause.innerHTML = "pause";
    pause.disabled = true;
}

function gameOverExit() {
    gameOver = true;
    win.play();
    openModal();
    saveResult();
    disablePause();
    getResult();
    return false;
}

function saveResult() {
    let number =  localStorage.getItem('number');
    if (number === null) {
        number = 0;
    }
    number++;
    localStorage.setItem("number", number);
    localStorage.setItem(number, point);
}

function compareNumbers(a, b) {
    return parseInt(b) - parseInt(a);
}

function getResult() {
    let keys = Object.keys(localStorage).sort(compareNumbers);
    keys = keys.slice(0, 11);

    let table_body = document.querySelector(".table_body");
    let fragment = document.createDocumentFragment();

    let empty_result = document.querySelector(".empty-result");
    let table = document.querySelector(".table");

    table_body.innerHTML = "";

    if(keys.length) {
        for (let i=0; key = keys[i]; i++) {
            if(key != "number"){
                fragment.appendChild(createGridCell(key.toString(), localStorage.getItem(key).toString().padStart(2, "0")));
            }
        }
        empty_result.style.display = "none";
        table.style.display = "flex";
        table_body.appendChild(fragment);
    } else {
        empty_result.style.display = "block";
        table.style.display = "none";
    }
}
  
function createGridCell(number, result) {
    let row = document.createElement('div');
    row.className = 'table-row';
    let col_number = document.createElement('div');
    col_number.className = 'table-col';
    col_number.textContent = number;
    let col_result = document.createElement('div');
    col_result.className = 'table-col';
    col_result.textContent = result;
    row.appendChild(col_number);
    row.appendChild(col_result);
    return row;
}


function hard() {
    if (snakeX < 0 || snakeX > cols*blockSize || snakeY < 0 || snakeY > rows*blockSize) {
         gameOverExit();
    }
}

function low() {
    if (snakeX < 0) {
        snakeX = cols*blockSize - blockSize;
    }
    else if (snakeX >= cols*blockSize) {
        snakeX = blockSize * (-1);
    }

    if (snakeY < 0) {
        snakeY = rows*blockSize - blockSize;
    }
    else if (snakeY >= rows*blockSize) {
        snakeY = blockSize * (-1);
    }
}

function createGrd() {
    grd = context.createLinearGradient(0.000, 150.000, 300.000, 150.000);
    grd.addColorStop(0.000, 'rgba(247, 149, 51, 1.000)');
    grd.addColorStop(0.151, 'rgba(243, 112, 85, 1.000)');
    grd.addColorStop(0.311, 'rgba(239, 78, 123, 1.000)');
    grd.addColorStop(0.462, 'rgba(161, 102, 171, 1.000)');
    grd.addColorStop(0.621, 'rgba(80, 115, 184, 1.000)');
    grd.addColorStop(0.748, 'rgba(16, 152, 173, 1.000)');
    grd.addColorStop(0.875, 'rgba(7, 179, 155, 1.000)');
    grd.addColorStop(1.000, 'rgba(111, 186, 130, 1.000)');

    return grd;
}

replay.addEventListener(
    "click",
    () => {
        regame();
    },
    false
);

pause.addEventListener(
    "click",
    () => {
        if(status_game) {
            clearInterval(refreshIntervalId);
            pause.innerHTML = "play";
            status_game = false;
        } else {
            refreshIntervalId = setInterval(update, 1000/10); 
            pause.innerHTML = "pause";
            status_game = true;
        }
    },
    false
);

level_game.forEach( (level, index) => {
    level.addEventListener('click', (e) => {
        levelType = e.target.value;
    });
});

closeModal.onclick = function() { 
    modal.style.display = "none";
}

function openModal() {
    modal.style.display = "block";
    final_score.innerHTML = point.toString().padStart(2, "0");
}

window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
}