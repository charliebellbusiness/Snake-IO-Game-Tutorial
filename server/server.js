const io = require("socket.io")( {
    cors: {
      origin: "*",
    }
  });

const { gameLoop, getUpdatedVelocity, initGame } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};

io.on('connection', client => {

     // CLIENT.ON CALLS REQUIRE NAMED FUNCTION CALL, INLINE FUNCTIONS BREAK SERVER.JS CODE FOR SOME REASON

    client.on('keydown', handleKeydown);
    client.on('swipe', handleSwipe);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame(gameCode) {
        const room = io.sockets.adapter.rooms[gameCode];

        let allUsers;
        if (room) {
            allUsers = room.sockets;
        }

        let numClients = 0;
        if (allUsers) {
            numClients = Object.keys(allUsers).length;
        }

        if (numClients === 0) {
            client.emit('unknownGame');
            return;
        } else if (numClients > 1) {
            client.emit('tooManyPlayers');
        } 

        clientRooms[client.id] = gameCode;
        
        client.join(gameCode);
        client.number = 2;
        client.emit('init', 2);

        startGameInterval(gameCode);
    }

    function handleNewGame() {
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame();

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    }

    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];
        
        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch(e) { 
            console.error(e); 
            return;
        }

        const vel = getUpdatedVelocity(keyCode, null);

        if (vel && state[roomName].players) {
            state[roomName].players[client.number - 1].vel = vel;
        }
    }

    function handleSwipe(swipeDir) {
        console.log("handleSwipe: " + swipeDir);

        if(!clientRooms) {
            return;
        }

        const roomName = clientRooms[client.id];
        
        if (!roomName) {
            return;
        }

        const vel = getUpdatedVelocity(null, swipeDir);

        if (vel && state[roomName].players) {
            state[roomName].players[client.number - 1].vel = vel;
        }        
    }

});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);

        if(!winner) {
            emitGameState(roomName, state[roomName]);
        } else {
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE);
};

function emitGameState(roomName, state) {
    io.sockets.in(roomName)
        .emit('gameState', JSON.stringify(state));
}

function emitGameOver(roomName, winner) {
    io.sockets.in(roomName)
        .emit('gameOver', JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 3000);
// io.listen(3000);