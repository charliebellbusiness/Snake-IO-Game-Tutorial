const BG_COLOUR = '#231f20';
var SNAKE1_COLOUR = '#c2c2c2';
var SNAKE2_COLOUR = 'red';
const FOOD_COLOUR = '#e66916';
var PLAYER_NUMBER = 0;

// const socket = io('https://evening-escarpment-62492.herokuapp.com/');

const socket = io('localhost:3000'); // internal testing

// socket.on("connect_error", (err) => {
//     console.log(`connect_error due to ${err.message}`);
//     socket.io.reconnect();
//     console.log("attempting to reconnect...");
//   });

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const gameCodeHeader = document.getElementById('gameCodeHeader');
const playerColourHeader = document.getElementById('playerColourHeader');
const playerColourDisplay = document.getElementById('playerColourDisplay');
const controlsDisplay = document.getElementById('controlsDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
window.addEventListener('touchstart', function() { controlsDisplay.textContent = "by swiping!"; });


function newGame() {
    PLAYER_NUMBER = 1;
    socket.emit('newGame');
    init();
}

function joinGame() {
    PLAYER_NUMBER = 2;
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";
    gameCodeHeader.style.display = "block";
    playerColourHeader.style.display = "none";

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);
    gameActive = true;
}

function keydown(e) {
    socket.emit('keydown', e.keyCode);
}

function swipeFunc(swipeDir) {
    // socket.emit('swipe', swipeDir);
    console.log("swipeFunc: " + swipeDir);
}

function paintGame (state) {
    // window.addEventListener('touchstart', swipeFunc("up"));
    playerColourDisplay.style.backgroundColor = window["SNAKE" + PLAYER_NUMBER + "_COLOUR"];

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    // Paint food on grid
    ctx.fillStyle = FOOD_COLOUR;
    // Convert gamespace pos of food to canvas pos of food
    ctx.fillRect(food.x * size, food.y * size, size, size);

    paintPlayer(state.players[0], size, SNAKE1_COLOUR);
    paintPlayer(state.players[1], size, SNAKE2_COLOUR);
}

function paintPlayer(playerState, size, colour){
    gameCodeHeader.style.display = "none";
    playerColourHeader.style.display = "block";

    const snake = playerState.snake;

    ctx.fillStyle = colour;
    
    // Paint player on grid
    for(let cell of snake) {
        // Convert gamespace pos of player to canvas pos of player
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }
}

function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState) {

    if(!gameActive) {
        return;
    }   

    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {

    if(!gameActive) {
        return;
    }

    data = JSON.parse(data);

    if(data.winner === playerNumber) {
        alert("You win!");
    } else { 
        alert("You lose!");
    }

    gameActive = false;
    reset();
}

function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
    reset();
    alert("Unknown game code");
}

function handleTooManyPlayers(){
    reset();
    alert("This game is already in progress");
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}

// TOUCH CONTROLS FROM STACK OVERFLOW TEST ---- https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android
document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);
var xDown = null;                                                        
var yDown = null;
function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}                                                     
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                
function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }
    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            /* left swipe */ 
            console.log("handleTouchMove function: left swipe");
            // swipeFunc("left");
            socket.emit('swipe', "left");
        } else {
            /* right swipe */
            console.log("handleTouchMove function: right swipe");
            // swipeFunc("right");
            socket.emit('swipe', "right");
        }                       
    } else {
        if ( yDiff > 0 ) {
            /* down swipe */ 
            // swipeFunc("up");
            console.log("handleTouchMove function: up swipe");
            socket.emit('swipe', "up");
        } else { 
            /* up swipe */
            // swipeFunc("down");
            console.log("handleTouchMove function: down swipe");
            socket.emit('swipe', "down");
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};