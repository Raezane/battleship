import {ship} from "./shipHandler.js"

const boardHandler = function() {
  let board = []

  const markers = {
    hit: 'x',
    miss: 'o',
    shipSurrounding: 'u'
  }

  const getGameBoard = () => board

  const buildBoard = function() {
    for (let y = 0; y < 10; y++) {
      let arr = [];
      for (let x = 0; x < 10; x++) {
        arr.push(null)
      }
      board.push(arr)
    }
  }

  const placeShip = function(ship, frontCoords, rearCoords) {

    /* function drawShipSurrounding() {
      
    } */

    function setShip(direction, frontCoords, rearCoords) {
      while (frontCoords[direction] <= rearCoords[direction]) {
        board[frontCoords[0]][frontCoords[1]] = ship
        frontCoords[direction] += 1
      }
    }

    function validPlacement(direction, frontCoords, rearCoords) {

      /* first check if the selected area for the ship to be placed is not
      already occupied. We'll create copy of the actual coordinates here so 
      that the iterator won't modify the original ones */
      let frontCoordsCopy = [...frontCoords];
      let rearCoordsCopy = [...rearCoords];

      function isSurroundingClear() {

        let surroundingArea = {
          north: board[frontCoordsCopy[0]-1][frontCoordsCopy[1]],
          northEast: board[frontCoordsCopy[0]-1][frontCoordsCopy[1]+1],
          east: board[frontCoordsCopy[0]][frontCoordsCopy[1]+1],
          southEast: board[frontCoordsCopy[0]+1][frontCoordsCopy[1]+1],
          south: board[frontCoordsCopy[0]+1][frontCoordsCopy[1]],
          southWest: board[frontCoordsCopy[0]+1][frontCoordsCopy[1]-1],
          west: board[frontCoordsCopy[0]][frontCoordsCopy[1]-1],
          northWest: board[frontCoordsCopy[0]-1][frontCoordsCopy[1]-1]
        };

        for (const key in surroundingArea) {
          if (surroundingArea[key] && typeof surroundingArea[key] === 'object') return false
        } return true

      }

      while (frontCoordsCopy[direction] <= rearCoordsCopy[direction]) {
          // check by iterating if the area where ship is placed is null and there aren't ships straight next to it.
          if (board[frontCoordsCopy[0]][frontCoordsCopy[1]] == null && isSurroundingClear()) {
            frontCoordsCopy[direction] += 1;    
            } else return false  
          };
        return true;
    };

    function HorizontalOrVertical(callback) {
      //here we give direction parameter as a number to callback function; 0 is vertical, 1 is horizontal
      if (frontCoords[0] < rearCoords[0]) {
        return callback(0, frontCoords, rearCoords)
      } else if (frontCoords[1] < rearCoords[1]) {
        return callback(1, frontCoords, rearCoords)
      };
    };

    let isValid = HorizontalOrVertical(validPlacement);
    if (isValid) HorizontalOrVertical(setShip);

  };

  const receiveAttack = function(y, x) {
    // check if the attacked square is empty by checking if square holds just a null
    if (board[y][x] == null) {
      board[y][x] = markers.miss;
    /* if not a number, then check if ship already resides in the square -> in other words, is the square a ship object. 
       If so, then hit the ship */
    } else if (typeof board[y][x] == 'object') {
      board[y][x].hit()
      board[y][x] = [board[y][x], markers.hit]
    };
  };

  return {getGameBoard, buildBoard, placeShip, receiveAttack}

}

let board = boardHandler();
board.buildBoard();
let ship1 = ship(3);
let ship3 = ship(4);
board.placeShip(ship1, [2,3], [2,6]);
board.placeShip(ship1, [1,3], [1,4]);
board.placeShip(ship3, [1,4], [3,4]);
board.getGameBoard()
board.receiveAttack(6,10)
board.receiveAttack(6,7)
board.getGameBoard()
ship1.getHits()


export {boardHandler}