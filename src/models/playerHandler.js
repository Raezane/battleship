import { boardHandler } from "./boardHandler";

const playerHandler = function() {

  const playerBoard = boardHandler();
  const initiateBoard = () => playerBoard.buildBoard();

  /* with availableMoves we have an array which has all the possible moves in the
  gameboard. Every time a player (computer or the human) makes a move, that 
  particular move gets removed from the array, effectively leaving less possible
  moves left */
  const availableMoves = [];
  const getAvailableMoves = () => availableMoves;

  const createAvailableMoves = () => {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        availableMoves.push([y, x]);
      };
    };
  };

  const makeMove = function(coords) {
    const index = availableMoves.findIndex(arr => 
      arr.length === coords.length && arr.every((val, i) => val === coords[i]));

    availableMoves.splice(index, 1);
  };

  return {playerBoard, initiateBoard, getAvailableMoves, createAvailableMoves, makeMove}
}

export {playerHandler}