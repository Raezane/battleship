import { boardHandler } from "../models/boardHandler.js";
import { ship } from "../models/shipHandler.js";

const displayHandler = function() {
  //declare interactive dom elements
  let playerBoardcells, enemyBoardCells;

  document.addEventListener('DOMContentLoaded', () => {
    initiateClickables()
    //attachListeners()
  });

  function initiateClickables() {
    playerBoardcells = document.querySelectorAll('.player div');
    enemyBoardCells = document.querySelectorAll('.enemy div');
    //console.log(playerBoardcells[5].getAttribute('col'));
  }

  function attachListeners() {

  }

  function boardRefresher(board, whichOne) {

    let boardCells;
    whichOne === 'player' ? boardCells = playerBoardcells : boardCells = enemyBoardCells;
    
    function isShip(cell) {
      return cell !== null && typeof cell === 'object'
    }

    boardCells.forEach(cell => {
      let row = cell.getAttribute('row');
      let col = cell.getAttribute('col');
      if (isShip(board[row][col]) == true) cell.classList.add('placedShip');
    });


  };

  return {initiateClickables, attachListeners, boardRefresher}
};

export {displayHandler}