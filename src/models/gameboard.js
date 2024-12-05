import {ship} from "./ship.js"

const gameBoard = function() {
  let board = []

  const getGameBoard = () => board

  const buildBoard = function() {
    for (let y = 0; y < 10; y++) {
      let arr = [];
      for (let x = 0; x < 10; x++) {
        arr.push(x)
      }
      board.push(arr)
    }
  }

  const placeShip = function(ship, frontCoords, rearCoords) {

    const placeVertically = function(frontCoords, rearCoords) {
      while (frontCoords[0] <= rearCoords[0]) {
        board[frontCoords[0]][frontCoords[1]] = ship
        frontCoords[0] += 1
      }
    }

    const placeHorizontally = function(frontCoords, rearCoords) {
      while (frontCoords[1] <= rearCoords[1]) {
        board[frontCoords[0]][frontCoords[1]] = ship
        frontCoords[1] += 1
      }
    }

    //check if ship is being placed horizontally or vertically and then access the correct function
    if (frontCoords[0] < rearCoords[0]) {
      placeVertically(frontCoords, rearCoords)
    } else if (frontCoords[1] < rearCoords[1]) {
      placeHorizontally(frontCoords, rearCoords)
    }
  }

  const receiveAttack = function(y, x) {
    // check if the attacked square is empty by checking if square holds just a number
    if (board[y][x] == x) {
      board[y][x] = 'o';
    // if not a number, then check if ship already resides in the square -> in other words, is the square a ship object
    } else if (typeof board[y][x] == 'object') {
      board[y][x].hit()
      board[y][x] = [board[y][x], 'o']
    };
  };

  return {getGameBoard, buildBoard, placeShip, receiveAttack}

}

let board = gameBoard();
board.buildBoard();
let ship1 = ship(3);
board.placeShip(ship1, [4,7], [6,7])
board.placeShip(ship1, [3,2], [3,5])
board.getGameBoard()
board.receiveAttack(6,10)
board.receiveAttack(6,7)
board.getGameBoard()
ship1.getHits()


export {gameBoard}