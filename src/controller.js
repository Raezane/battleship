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

const mapDOMshipsToObjects = function(createdShips) {
  let domShips = display.gethorizontalDraggableShips()
  let i = 0;

  for (let domShip of domShips) {
    shipMapping.set(domShip, createdShips[i])
    i += 1;
  };
};

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
        [row, col] = computerInt.getFirstOfStruckShipSurr(playerBoardObj);
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

const currentAreaAvailable = function(shipFrontCoords, shipRearCoords) {
  /* first parse dom string coordinates to interegrs, which we may then
  use in our boardhandler to evaluate ship placement validity */
  shipFrontCoords = shipFrontCoords.map(number => +number);
  shipRearCoords = shipRearCoords.map(number => +number);

  return player.playerBoard.validPlacement(shipFrontCoords, shipRearCoords)

} 

const handlePlacement = function(formerShipParentCell, shipFrontCoords, shipRearCoords, draggedShipImg) {
  
  /* check if the former grandparent of the ship is a cell and not the initial 
  area where the ships are being dragged originally from*/
  if (!formerShipParentCell.parentNode.classList.contains('placeableships')) {
  
    let selector = '.' + draggedShipImg.classList[2];
    let shipObj = shipMapping.get(document.querySelector(selector))
    
    let placedShips = player.playerBoard.getPlacedShips();
    let placedShipObj = player.playerBoard.findPlacedShip(placedShips, shipObj);

    player.playerBoard.nullifyCurrentShipArea(playerBoardObj, placedShipObj)
    player.playerBoard.emptyShipSurrounding(playerBoardObj, placedShipObj);

    //let placedShips = player.playerBoard.getPlacedShips();
    //let placedShipObj = player.playerBoard.findPlacedShip(placedShips, shipObj);
  }
  
  /* parse dom string coordinates to integers, which we may then
  use in our boardhandler to evaluate ship placement validity and place it */
  shipFrontCoords = shipFrontCoords.map(number => +number);
  shipRearCoords = shipRearCoords.map(number => +number);
  //we'll save a correct ship image to a variable..
  let selector = '.' + draggedShipImg.classList[2]
  //..which we'll then use as a map key to get a corresponding ship object
  let shipObj = shipMapping.get(document.querySelector(selector))

  /* and now we have all we need (ship's front and rear coords and the shipobject),
  which we pass straight to boardHandler to place the ship to our internal gameboard */
  player.playerBoard.setShip(shipFrontCoords, shipRearCoords, shipObj);
  
  console.log(player.playerBoard.getGameBoard())
} 

const handleTurn = function(e) {

  let verticalShips = display.getVerticalDraggableShips();
  let parent = e.target.parentNode;

  //turn strings to int with '+'prefix
  let frontCoords = [+parent.dataset.row, +parent.dataset.col];
  let shipLength = +(e.target.dataset.shipsize);
  let rearCoords;

  let currentDirection = e.target.classList[1];

  if (currentDirection === 'horizontal') {
    rearCoords = [frontCoords[0] + shipLength-1, frontCoords[1]]
  } else rearCoords = [frontCoords[0], frontCoords[1] + shipLength-1]

  let currentShipDOMobj = e.target.classList[2];
  let replacingShipImg = verticalShips[currentShipDOMobj]

  let selector = '.' + currentShipDOMobj
  let shipObj = shipMapping.get(document.querySelector(selector))

  if (isInBounds(rearCoords)) {

    let placedShips = player.playerBoard.getPlacedShips();
    let placedShipObj = player.playerBoard.findPlacedShip(placedShips, shipObj);
  
    player.playerBoard.emptyShipSurrounding(playerBoardObj, placedShipObj);
    
    if (player.playerBoard.cellIsNull(rearCoords)) {
      display.turnShip(parent, replacingShipImg) 
    } else display.invalidPlacementText()

  } else display.invalidPlacementText()

  /* let shioObj = player.playerBoard.getPlacedShips()
  let direction = e.target
  let shipLength = e.target.dataset.shipsize
  let shipFrontCoords = [e.target.parentNode.getAttribute('row'), e.target.parentNode.getAttribute('col')]; 
  console.log(shioObj) */
}

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
}


const init = function() {
  activateDOMelements();
  toggleElementVisibility(display.toggleGameTable);
  toggleElementVisibility(display.toggleWinnerAndRetryHeader);
  toggleElementVisibility(display.toggleNewGameButtons);
  createBoardAndShips(player);
  mapDOMshipsToObjects(player.playerBoard.getCreatedShips())
  /*createBoardAndShips(computer);
  createMovesForComputer(computerInt)
  automateShipPlacement(player);
  automateShipPlacement(computer);
  setShipImages();
  startGame(); */
}

export {init, handleAttack, handleTurn, currentAreaAvailable, handlePlacement}