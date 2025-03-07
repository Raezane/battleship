import { playerHandler } from "./models/playerHandler.js";
import { displayHandler } from "./ui/displayHandler.js";
import { getRandomNumber, isInBounds } from "./utilities.js";
import { computerIntelligence } from "./computerIntelligence.js";

let player = playerHandler();
let computer = playerHandler();
let computerInt = computerIntelligence();

let playerBoardObj = player.playerBoard.getGameBoard();

const display = displayHandler();

let shipMapping = new Map();

const getShipMapping = () => shipMapping;

const activateDOMelements = function() {
  display.initiateDOM();
  display.attachListeners();
};

const createBoardAndShips = function(participant) {
  participant.initiateBoard();
  participant.playerBoard.createShips();
}

const mapDOMshipsToObjects = function(createdShips) {
  let horizontalShips = display.getHorizontalDraggableShips();
  let verticalShips = display.getVerticalDraggableShips();
  let i = 0;

  function mapper(shipImages) {
    for (let domShip of shipImages) {
      shipMapping.set(domShip[1], createdShips[i])
      i += 1;
    };
    i = 0;
  };

  mapper(horizontalShips);
  mapper(verticalShips);

};

const createMovesForComputer = function (participant) {
  participant.createAvailableMoves();
}

const initGameLoop = function() {

  let playerOne;
  let playerTwo;

  let sunkenPlayerShips = player.playerBoard.getSunkenShips();
  let sunkenEnemyShips = computer.playerBoard.getSunkenShips()
  
  function setStarterPlayer() {
    let whoStarts = getRandomNumber(2);
    if (whoStarts == 0) {
      playerOne = playerTurn;
      playerTwo = computerTurn;
      display.setEnemyTurnHeaderToBeHidden();
      display.addHideClassToTurnHeader();
    } else {
      playerOne = computerTurn;
      playerTwo = playerTurn;
      display.setYourTurnHeaderToBeHidden();
      display.addHideClassToTurnHeader();
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
        [row, col] = computerInt.getFirstOfStruckShipSurr(playerBoardObj);
      }

      display.emulateEnemyClick(row, col);

      display.addHideClassToTurnHeader();
      display.removeHideClassFromTurnHeader();

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
      display.addHideClassToTurnHeader();
      display.removeHideClassFromTurnHeader();
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
  if (sunkenPlayerShips.length == 10) {
    display.showGameResult('You lose!');
    display.colorGameResultTitle('negative');
  } else {
    display.showGameResult('You win!');
    display.colorGameResultTitle('positive');
  }
  display.toggleWinnerAndRetryHeader();
  display.toggleNewGameButtons();
} 

const currentAreaAvailable = function(shipFrontCoords, shipRearCoords, dragged) {
  /* first parse dom string coordinates to interegrs, which we may then
  use in our boardhandler to evaluate ship placement validity */
  shipFrontCoords = shipFrontCoords.map(number => +number);
  shipRearCoords = shipRearCoords.map(number => +number);

  if (shipFrontCoords[0] < shipRearCoords[0] && dragged.classList.contains('horizontal')) return false;
  if (shipFrontCoords[1] < shipRearCoords[1] && dragged.classList.contains('vertical')) return false;
  if (!player.playerBoard.validPlacement(shipFrontCoords, shipRearCoords)) return false;
  else return true
  
} 

const clearCurrentArea = function(draggedShipImg) {
  
    let shipObj = shipMapping.get(draggedShipImg)
    
    let placedShips = player.playerBoard.getPlacedShips();
    let placedShipObj = player.playerBoard.findPlacedShip(placedShips, shipObj);

    player.playerBoard.nullifyCurrentShipArea(playerBoardObj, placedShipObj);
    player.playerBoard.emptyShipSurrounding(playerBoardObj, placedShipObj);

}

const handlePlacement = function(shipFrontCoords, shipRearCoords, draggedShipImg) {
  
  /* parse dom string coordinates to integers, which we may then
  use in our boardhandler to evaluate ship placement validity and place it */
  shipFrontCoords = shipFrontCoords.map(number => +number);
  shipRearCoords = shipRearCoords.map(number => +number);

  let shipObj = shipMapping.get(draggedShipImg);

  /* and now we have all we need (ship's front and rear coords and the shipobject),
  which we pass straight to boardHandler to place the ship to our internal gameboard */
  player.playerBoard.setShip(shipFrontCoords, shipRearCoords, shipObj);
  display.hidePlacingInfo();
  if (areAllShipsSet()) display.togglePlayButton('show')
} 

const handleTurn = function(e) {

  /* if the clicked ship (ship being turn) is a boat, we don't need to turn that 
  because it takes only one cell. If it's a boat, stop processing here. */
  if (e.target.dataset.shipsize < 2) return

  let parent = e.target.parentNode;

  //turn strings to int with '+'prefix
  let frontCoords = [+parent.dataset.row, +parent.dataset.col];
  let shipLength = +(e.target.dataset.shipsize);

  let currentRearCoords;
  let newRearCoords;

  let replacingShipImg;
  
  let shipKey = e.target.classList[2];
  let currentDirection = e.target.classList[1];

  if (currentDirection === 'horizontal') {
    currentRearCoords = [frontCoords[0], frontCoords[1] + shipLength-1];
    newRearCoords = [frontCoords[0] + shipLength-1, frontCoords[1]];
    replacingShipImg = display.getVerticalDraggableShips().get(shipKey);
  } else {
    currentRearCoords = [frontCoords[0] + shipLength-1, frontCoords[1]];
    newRearCoords = [frontCoords[0], frontCoords[1] + shipLength-1];
    replacingShipImg = display.getHorizontalDraggableShips().get(shipKey);
  }

  if (isInBounds(newRearCoords)) {

    let shipObj = shipMapping.get(e.target);
    
    clearCurrentArea(e.target);
    
    if (player.playerBoard.cellIsNull(newRearCoords)) {
      player.playerBoard.setShip(frontCoords, newRearCoords, shipObj);
      display.turnShip(parent, replacingShipImg);
    } else {
      player.playerBoard.setShip(frontCoords, currentRearCoords, shipObj);
      display.invalidPlacementText("Can't turn here, another ship would be too close!")
    } 

  } else display.invalidPlacementText("Can't place here, ship would be out of bounds!")
};

const handleAttack = function(domBoard, row, col) {

  /* first convert dom data string numbers to integers, which the 
  playerHandler and boardHandler can then use */
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
    computerInt.addStruckShipSurroundings(coordsHit, playerBoardObj);
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
};

const setShipsAuto = function() {
  display.removeShipImgs(player.playerBoard.getPlacedShips());
  player.playerBoard.emptyBoard();
  player.playerBoard.emptyPlacedShips();
  player.playerBoard.emptySurroundingCells();
  player.playerBoard.setShipsRandomly();
  display.setShips('shipSetterCells', player.playerBoard.getPlacedShips());
  display.hidePlacingInfo();
  display.togglePlayButton('show');
}

const areAllShipsSet = function() {
  let setShips = player.playerBoard.getPlacedShips();
  return setShips.length < 10 ? false : true
}

const startGame = function() {
  display.hideModal();
  display.toggleGameTable();
  createBoardAndShips(computer);
  createMovesForComputer(computerInt);
  computer.playerBoard.setShipsRandomly();
  display.setShips('subCellsPlayer', player.playerBoard.getPlacedShips());
  initGameLoop();
};

const takeNewRound = function() {
  location.reload();
}

const redirect = function() {
  window.location.href = "https://github.com";
}

const init = function() {
  activateDOMelements();
  display.toggleGameTable();
  display.toggleWinnerAndRetryHeader();
  display.toggleNewGameButtons();
  display.togglePlayButton('hide');
  createBoardAndShips(player);
  mapDOMshipsToObjects(player.playerBoard.getCreatedShips());
};

export {
  init, 
  startGame, 
  takeNewRound, 
  redirect, 
  getShipMapping,
  handleAttack, 
  setShipsAuto,
  currentAreaAvailable, 
  clearCurrentArea, 
  handlePlacement, 
  handleTurn
}