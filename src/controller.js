import { playerHandler } from "./models/playerHandler.js";
import { displayHandler } from "./ui/displayHandler.js";

const gameController = function() {

  const display = displayHandler();

  function activateDOMelements() {
    display.initiateDOM();
    display.attachListeners();
  }

  activateDOMelements();

  const player = playerHandler();
  const computer = playerHandler();
  
  player.createAvailableMoves();
  computer.createAvailableMoves();

  player.initiateBoard();
  player.playerBoard.createShips();
  player.playerBoard.setCreatedShips();

  computer.initiateBoard();
  computer.playerBoard.createShips();
  computer.playerBoard.setCreatedShips();
  console.log(computer.playerBoard.getGameBoard());

  display.setPlayerShips(player.playerBoard.getGameBoard());

  function startGame() {

  }

  function handleAttack(domBoard, row, col) {

    /* first convert dom data strings to integers, which the playerHandler 
    and boardHandler can then use */
    let rowInt = +row
    let colInt = +col
    
    let whichGameBoard;
    if (domBoard == 'player') {
      whichGameBoard = player.playerBoard
      player.makeMove(rowInt, colInt);
    } else {
      whichGameBoard = computer.playerBoard
      computer.makeMove(rowInt, colInt);
    }
    
    whichGameBoard.receiveAttack(rowInt, colInt);

    let boardObj = whichGameBoard.getGameBoard();
    console.log(boardObj)
    display.refreshBoard(domBoard, boardObj);
  }

  startGame();

  return {handleAttack}
};


export {gameController}