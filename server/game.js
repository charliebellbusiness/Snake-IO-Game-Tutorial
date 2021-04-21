const { GRID_SIZE } = require('./constants');

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity,
    initGame
}

function initGame() {
    const state = createGameState();
    randomFood(state);
    return state;
}

function createGameState() {
    return {
        players: [
            {
            // Player 1
            pos: {
                x: 3,
                y: 10,
            },
            vel: {
                x: 0,
                y: 0,
            },
            snake: [
                {x: 1, y: 10},
                {x: 2, y: 10},
                {x: 3, y: 10}
            ],
        }, 
        // Player 2
        {
            pos: {
                x: 18,
                y: 10,
            },
            vel: {
                x: 0,
                y: 0,
            },
            snake: [
                {x: 20, y: 10},
                {x: 19, y: 10},
                {x: 18, y: 10}
            ],}
        ],
        food: {
        },
        gridsize: GRID_SIZE,
        active: true,
    }
}

function gameLoop(state) {
   if (!state) {
       console.log("state does not exist??");
       return;
   }
   
   const playerOne = state.players[0];
   const playerTwo = state.players[1];

   playerOne.pos.x += playerOne.vel.x;
   playerOne.pos.y += playerOne.vel.y;

   playerTwo.pos.x += playerTwo.vel.x;
   playerTwo.pos.y += playerTwo.vel.y;

   if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
       return 2; // Return winner, player 2 wins if player 1 leaves game arena
   }

   if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
    return 1; // Return winner, player 1 wins if player 2 leaves game arena
    }

   if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
       
       // See if player is touching a food object, if so increase snake length by one
       playerOne.snake.push({ ...playerOne.pos })
       playerOne.pos.x += playerOne.vel.x;
       playerOne.pos.y += playerOne.vel.y; 
    
       // Place a new food object in a random space
       randomFood(state);
   }

   if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
       
    // See if player two is touching a food object, if so increase snake length by one
    playerTwo.snake.push({ ...playerTwo.pos })
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y; 
 
    // Place a new food object in a random space
    randomFood(state);
}

   // See if player is moving
   if (playerOne.vel.x || playerOne.vel.y) {

       //increment to see if snake has bumped self 
       for (let cell of playerOne.snake) {
           if(cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
            return 2; //Player 1 has lost
           }
       }

       // Move player one snake on grid if velocity exists
       playerOne.snake.push({ ...playerOne.pos });
       playerOne.snake.shift();
   }

   // See if player two is moving
   if (playerTwo.vel.x || playerTwo.vel.y) {

    //increment to see if snake has bumped self 
    for (let cell of playerTwo.snake) {
        if(cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
         return 1; //Player 2 has lost
        }
    }

    // Move player two snake on grid if velocity exists
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
}

   return false;
}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    }

    for (let cell of state.players[0].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }
    
    for (let cell of state.players[1].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }

    state.food = food;
}

function getUpdatedVelocity(keyCode, swipeDir) {

    // If player is using keyboard
    if (!swipeDir) {
    switch (keyCode) {
        // 37, 38, 39, 40 = Left, Down, Right, Up
        case 37: { // left
        return {x: -1, y: 0}; 
        }
        case 38: { //down 
        return {x: 0, y: -1};
        }
        case 39: { //right 
            return {x: 1, y: 0} ;
        }
        case 40: { //up
            return {x: 0, y: 1} ;
        }
    }
}

    // If player is using touch controls
    if (!keyCode) {
        switch (swipeDir) {
            // 37, 38, 39, 40 = Left, Down, Right, Up
            case "left": { // left
            return {x: -1, y: 0}; 
            }
            case "down": { //down 
            return {x: 0, y: -1};
            }
            case "right": { //right 
                return {x: 1, y: 0} ;
            }
            case "up": { //up
                return {x: 0, y: 1} ;
            }
        }
    


}
}