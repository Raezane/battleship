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

const startGame = async function() {

  let clickableEnemyBoard = display.getBoardCells()['mainCellsEnemy'];

  let playerTurn;
  let computerTurn;

  let sunkenPlayerShips = player.playerBoard.getSunkenShips();
  let sunkenEnemyShips = computer.playerBoard.getSunkenShips()
  
  function setStarterPlayer() {
    let whoseStarts = getRandomNumber(2);
    if (whoseStarts == 0) {
      playerTurn == true;
      computerTurn == false;
    } else {
      playerTurn == false;
      computerTurn == true;
    };
  };

  function enemyTurn() {
    let [row, col] = computer.makeMove();
    display.emulateEnemyClick(row, col);

  /*setTimeout(() => {
    enemyTurn();
  }, 1000); */
  };

  function playerTurnFunc() {

    return new Promise((resolve) => {
      display.setResolveClick(resolve)
    });

  };

  setStarterPlayer();

  while (sunkenPlayerShips.length < 10 && sunkenEnemyShips.length < 10) {
    setTimeout(() => {
      enemyTurn();
    }, 1000);
    await playerTurnFunc(clickableEnemyBoard);
  }
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