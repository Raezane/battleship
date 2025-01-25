import { playerHandler } from "./models/playerHandler.js";
import { displayHandler } from "./ui/displayHandler.js";
import { getRandomNumber } from "./utilities.js";

let player = playerHandler();
let computer = playerHandler();

const display = displayHandler();

const activateDOMelements = function() {
  display.initiateDOM();
  display.attachListeners();
};

const createBoardAndShips = function(participant) {
  participant.initiateBoard();
  participant.playerBoard.createShips();
}

const createMovesForPlayers = function (participant) {
  participant.createAvailableMoves();
}

const automateShipPlacement = function(participant) {
  participant.playerBoard.setShipsRandomly();
}

/*console.log(player.playerBoard.getGameBoard());
console.log(computer.playerBoard.getGameBoard());
console.log(computer.playerBoard.getPlacedShips()) */

const setShipImages = function() {
  display.setShips('subCellsPlayer', player.playerBoard.getPlacedShips());
}

const startGame = function() {

  let playerOne;
  let playerTwo;

  let sunkenPlayerShips = player.playerBoard.getSunkenShips();
  let sunkenEnemyShips = computer.playerBoard.getSunkenShips()
  
  function setStarterPlayer() {
    let whoStarts = getRandomNumber(2);
    if (whoStarts == 0) {
      playerOne = playerTurn;
      playerTwo = computerTurn;
      display.hideEnemyTurnHeader();
      display.hideTurnTitle();
    } else {
      playerOne = computerTurn;
      playerTwo = playerTurn;
      display.hideYourTurnHeader();
      display.hideTurnTitle();
    }
  };

  function computerTurn() {

    display.makePlayerBoardUnClickable();
    display.makeEnemyBoardUnClickable();

    function timeoutWrapper() {

      display.makePlayerBoardClickable();

      let [row, col] = computer.getMove();

      display.emulateEnemyClick(row, col);

      display.hideTurnTitle();
      display.showTurnTitle();

      let cellsHit = player.playerBoard.getCellsHit();

      /* we remove the cell/cells from availableMoves which has/have been hit so that
      less possible cells that can be attacked remain. */
      computer.refreshAvailableMoves(cellsHit);

      /* ..and then we reset the opponent's board's cellsHit array to empty so that the 
      refreshAvailableMoves method in playerHandler module has less items to iterate through 
      and thus the performance will be a bit better. */
      player.playerBoard.resetCellsHit();

    };

    return new Promise((resolve) => {
      setTimeout(() => {
        timeoutWrapper();
        resolve();
      }, 1000);
    });

  };

  function playerTurn() {
    
    display.makePlayerBoardUnClickable();
    display.makeEnemyBoardClickable();
    
    let clickPromise = new Promise((resolve) => {
      display.setResolveClick(resolve);
    });

    clickPromise.then(() => { 
      display.hideTurnTitle();
      display.showTurnTitle();
    });

    return clickPromise
  };

  async function gameLoop(playerOne, playerTwo) {
    while (sunkenPlayerShips.length < 10 && sunkenEnemyShips.length < 10) {
      await playerOne();
      await playerTwo();
    };
  };

  setStarterPlayer();
  gameLoop(playerOne, playerTwo);

};

function handleAttack(domBoard, row, col) {

  /* first convert dom data strings to integers, which the playerHandler 
  and boardHandler can then use */
  let rowInt = +row
  let colInt = +col
  
  let whichGameBoard;
  let subBoard;

  if (domBoard == 'player') {
    domBoard = 'mainCellsPlayer';
    subBoard = 'subCellsPlayer';
    whichGameBoard = player.playerBoard
  } else {
    domBoard = 'mainCellsEnemy';
    subBoard = 'subCellsEnemy';
    whichGameBoard = computer.playerBoard
  }

  let sunkenShipsStatus = whichGameBoard.getSunkenShips().length;
  
  whichGameBoard.receiveAttack(rowInt, colInt);

  let boardObj = whichGameBoard.getGameBoard();
  let sunkenShipsUpdated = whichGameBoard.getSunkenShips().length;
  
  console.log(boardObj)

  if (sunkenShipsUpdated > sunkenShipsStatus) {
    if (domBoard == 'mainCellsPlayer') {
      let shipsStatus = whichGameBoard.getPlacedShips();
      display.setShips(subBoard, shipsStatus);
    } else {
      let onlySunkenShips = whichGameBoard.getSunkenShips();
      display.setShips(subBoard, onlySunkenShips);
    }
  };

  display.refreshBoard(domBoard, boardObj);
}


const init = function() {
  activateDOMelements();
  createBoardAndShips(player);
  createBoardAndShips(computer);
  createMovesForPlayers(player);
  createMovesForPlayers(computer)
  automateShipPlacement(player);
  automateShipPlacement(computer);
  setShipImages();
  startGame();
}

export {init, handleAttack}