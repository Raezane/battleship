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
  player.playerBoard.setShipsRandomly();

  computer.initiateBoard();
  computer.playerBoard.createShips();
  computer.playerBoard.setShipsRandomly();
  console.log(player.playerBoard.getGameBoard());
  console.log(computer.playerBoard.getGameBoard());
  console.log(computer.playerBoard.getPlacedShips())

  display.setPlayerShips('subBoardPlayer', player.playerBoard.getPlacedShips());
  //display.setPlayerShips('subBoardEnemy', computer.playerBoard.getPlacedShips());

  function startGame() {

  }

  function handleAttack(domBoard, row, col) {

    /* first convert dom data strings to integers, which the playerHandler 
    and boardHandler can then use */
    let rowInt = +row
    let colInt = +col
    
    let whichGameBoard;
    let subBoard;

    if (domBoard == 'player') {
      domBoard = 'mainBoardPlayer';
      subBoard = 'subBoardPlayer';
      whichGameBoard = player.playerBoard
      player.makeMove([rowInt, colInt]);
    } else {
      domBoard = 'mainBoardEnemy';
      subBoard = 'subBoardEnemy';
      whichGameBoard = computer.playerBoard
      computer.makeMove([rowInt, colInt]);
    }

    let sunkenShipsStatus = whichGameBoard.getSunkenShips().length;
    
    whichGameBoard.receiveAttack(rowInt, colInt);

    let boardObj = whichGameBoard.getGameBoard();
    let sunkenShipsUpdated = whichGameBoard.getSunkenShips().length;
    
    console.log(boardObj)

    if (sunkenShipsUpdated > sunkenShipsStatus) {
      let shipsStatus = whichGameBoard.getPlacedShips();
      display.setPlayerShips(subBoard, shipsStatus)
    }

    display.refreshBoard(domBoard, boardObj);
  }

  startGame();

  return {handleAttack}
};


export {gameController}