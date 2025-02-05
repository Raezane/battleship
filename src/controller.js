import { playerHandler } from "./models/playerHandler.js";
import { displayHandler } from "./ui/displayHandler.js";
import { getRandomNumber } from "./utilities.js";
import { computerIntelligence } from "./computerIntelligence.js";

let player = playerHandler();
let computer = playerHandler();
let computerInt = computerIntelligence();

const display = displayHandler();

const activateDOMelements = function() {
  display.initiateDOM();
  display.attachListeners();
};

const toggleElementVisibility = function(callback) {
  display.toggleElementVisibility(callback);
}

const createBoardAndShips = function(participant) {
  participant.initiateBoard();
  participant.playerBoard.createShips();
}

const createMovesForComputer = function (participant) {
  participant.createAvailableMoves();
}

const automateShipPlacement = function(participant) {
  participant.playerBoard.setShipsRandomly();
}

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
      display.addHideClass();
    } else {
      playerOne = computerTurn;
      playerTwo = playerTurn;
      display.hideYourTurnHeader();
      display.addHideClass();
    }
  };

  function computerTurn() {

    display.makePlayerBoardUnClickable();
    display.makeEnemyBoardUnClickable();

    function timeoutWrapper() {

      display.makePlayerBoardClickable();

      let wasLastAttackHit = computerInt.getStruckShipSurroundings();
      let row, col;
      
      if (wasLastAttackHit.length == 0) {
        [row, col] = computerInt.getMove();
      } else {
        let playerBoard = player.playerBoard.getGameBoard();
        [row, col] = computerInt.getFirstOfStruckShipSurr(playerBoard);
      }

      display.emulateEnemyClick(row, col);

      display.addHideClass();
      display.removeHideClass();

      let cellsHit = player.playerBoard.getCellsHit();

      /* we remove the cell/cells from availableMoves which has/have been hit so that
      less possible cells that can be attacked remain. */
      computerInt.refreshAvailableMoves(cellsHit);

      /* ..and then we reset the opponent's board's cellsHit array to empty so that the 
      refreshAvailableMoves method in playerHandler module has less items to iterate through 
      and thus the performance will be a bit better. */
      player.playerBoard.resetCellsHit();

    };

    return new Promise((resolve) => {
      setTimeout(() => {
        timeoutWrapper();
        resolve();
      }, 700);
    });

  };

  function playerTurn() {
    
    display.makePlayerBoardUnClickable();
    display.makeEnemyBoardClickable();
    
    let clickPromise = new Promise((resolve) => {
      display.setResolveClick(resolve);
    });

    clickPromise.then(() => { 
      display.addHideClass();
      display.removeHideClass();
    });

    return clickPromise
  };

  async function gameLoop(playerOne, playerTwo) {
    while (true) {
      await playerOne();
      if (areAllShipsSunk()) break;
      await playerTwo();
      if (areAllShipsSunk()) break;
    };
    handleGameEnd(sunkenPlayerShips);
  };

  function areAllShipsSunk() {
    return sunkenPlayerShips.length == 10 || sunkenEnemyShips.length == 10
  }

  setStarterPlayer();
  gameLoop(playerOne, playerTwo);

};

const handleGameEnd = function(sunkenPlayerShips) {
  display.hideBothTurnTitles();
  display.removeBoardListeners();
  sunkenPlayerShips.length == 10 ? display.showGameResult('You lose!') : display.showGameResult('You win!')
  toggleElementVisibility(display.toggleWinnerAndRetryHeader);
  toggleElementVisibility(display.toggleNewGameButtons);
} 

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
  
  let coordsHit = whichGameBoard.receiveAttack(rowInt, colInt);
  if (coordsHit && domBoard == 'mainCellsPlayer') {
    let playerBoard = player.playerBoard.getGameBoard();
    computerInt.addStruckShipSurroundings(coordsHit, playerBoard);
  };

  let boardObj = whichGameBoard.getGameBoard();
  let sunkenShipsUpdated = whichGameBoard.getSunkenShips().length;

  if (sunkenShipsUpdated > sunkenShipsStatus) {
    if (domBoard == 'mainCellsPlayer') {
      computerInt.resetStruckShipSurroundings();
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
  toggleElementVisibility(display.toggleGameTable);
  toggleElementVisibility(display.toggleWinnerAndRetryHeader);
  toggleElementVisibility(display.toggleNewGameButtons);
  createBoardAndShips(player);
  createBoardAndShips(computer);
  createMovesForComputer(computerInt)
  automateShipPlacement(player);
  automateShipPlacement(computer);
  setShipImages();
  startGame();
}

export {init, handleAttack}