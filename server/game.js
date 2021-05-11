const { GRID_SIZE } = require('./constants');

// Export functions from this file to be used in another
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

// Define game properties such as array of player objects, game settings, etc
// PLAYER VALUES AND PLAYER AMOUNT ARE CURRENTLY HARDCODED! 
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
            ], // Each snake part requires another set of coordinates
            colour: '',
            facing: 'right'
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
            ],
            facing: 'left'
        }

        ],

        // Game settings
        food: {
        },
        gridsize: GRID_SIZE,
        active: true,
    }
}

// TODO: Refactor gameLoop for scaling player counts
// Rather than create constants for each player, structure code similar to below block
// var playersArray = state.players;
// for (player in playersArray) {
//      player.pos.x += player.vel.x;
//      player.pox.y += player.vel.y
// }

function gameLoop(state) {
   if (!state) {
       console.log("State does not exist.");
       return;
   }
   
   const playerOne = state.players[0];
   const playerTwo = state.players[1];
   
   // Add player's velocity to player's position
   playerOne.pos.x += playerOne.vel.x;
   playerOne.pos.y += playerOne.vel.y;

   playerTwo.pos.x += playerTwo.vel.x;
   playerTwo.pos.y += playerTwo.vel.y;

   // Check Game Over conditions for each player, then return number of other player
   if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
       return 2; // Return winner, player 2 wins if player 1 leaves game arena
   }

   if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
    return 1; // Return winner, player 1 wins if player 2 leaves game arena
    }

    // Check player collision with food object for each player
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

       //increment to see if snake has bumped other snake
       for(let cell of playerOne.snake) {

        if (playerTwo.snake.some(e => e.x === cell.x) && playerTwo.snake.some(e => e.y === cell.y)) {
            console.log("Player 1 is kill");
            return 2; // Player 2 has destroyed player 1
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

    //increment to see if snake has bumped other snake
    for(let cell of playerTwo.snake) {

        if (playerOne.snake.some(e => e.x === cell.x) && playerOne.snake.some(e => e.y === cell.y)) {
            console.log("Player 2 is kill");
            return 1; // Player 1 has destroyed player 2
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

    // Generate food only if randomized position does not collide with any part of players, else randomize again
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
            return {x: 0, y: 1};
        }
    }
}

    // If player is using touch controls
    if (!keyCode) {
        switch (swipeDir) {
            // 37, 38, 39, 40 = Left, Down, Right, Up
            case "left": { // left
                // console.log("Velocity: left swipe");
            return {x: -1, y: 0}; 
            }
            case "down": { //down 
                // console.log("Velocity: down swipe");
            return {x: 0, y: 1};
            }
            case "right": { //right 
                // console.log("Velocity: right swipe");
                return {x: 1, y: 0} ;
            }
            case "up": { //up
                // console.log("Velocity: right swipe");
                return {x: 0, y: -1} ;
            }
        }
    


}
}