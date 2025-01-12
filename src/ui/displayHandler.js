import { controller } from "../index.js";
import { getSurroundingArea, getRandomNumber, isInBounds, isShip } from "../utilities.js";

//ship models
import ship1 from "../assets/images/boat1.png";
import ship2A from "../assets/images/ship_small_body.png";
import ship2B from "../assets/images/ship_small_body_destroyed.png";
import ship3A from "../assets/images/ship_medium_body.png";
import ship3B from "../assets/images/ship_medium_body_destroyed.png";
import ship4A from "../assets/images/ship_large_body.png";
import ship4B from "../assets/images/ship_large_body_destroyed.png";

//explosion and misshit models
import explosion from "../assets/images/explosion.png";
import watersplash from "../assets/images/watersplash.png";

const displayHandler = function() {

  //declare interactive dom elements in object
  let boardCells = {
    'subBoardPlayer': null,
    'mainBoardPlayer': null,
    'subBoardEnemy': null,
    'mainBoardEnemy': null
  }

  document.addEventListener('DOMContentLoaded', () => {
    initiateDOM();
    //initiateImages()
  });

  function initiateDOM() {
    boardCells['subBoardPlayer'] = document.querySelectorAll('.player .sub > div');
    boardCells['mainBoardPlayer'] = document.querySelectorAll('.player > div:nth-child(n+2)');
    boardCells['subBoardEnemy'] = document.querySelectorAll('.enemy .sub > div');
    boardCells['mainBoardEnemy'] = document.querySelectorAll('.enemy > div:nth-child(n+2)');
  }

  /* function initiateImages() {
 
  } */
 
  function attachListeners() {
    
    function setBoardCellListeners(playerOrComp) {
      playerOrComp.forEach((cell) => {
        cell.addEventListener('click', getClickedCell)
      });
    };

    setBoardCellListeners(boardCells['mainBoardPlayer']);
    setBoardCellListeners(boardCells['mainBoardEnemy']);
  };

  function getClickedCell() {
    let clickedBoard = this.parentNode.classList[0];
    let row = this.getAttribute('row');
    let col = this.getAttribute('col');
    controller.handleAttack(clickedBoard, row, col);
  };

  function getPlayerShipImg(shipObject, shipLength) {
    let isSunk = shipObject.isSunk();

    if (shipLength == 1) return shipImages.boat;
    if (shipLength == 2 && isSunk == false) return shipImages.shipSmall;
    if (shipLength == 2 && isSunk) return shipImages.shipSmallDestroyed;
    if (shipLength == 3 && isSunk == false) return shipImages.shipMedium;
    if (shipLength == 3 && isSunk) return shipImages.shipMediumDestroyed;
    if (shipLength == 4 && isSunk == false) return shipImages.shipLarge;
    if (shipLength == 4 && isSunk) return shipImages.shipLargeDestroyed;
  }

  function getSunkenEnemyShipImg(shipLength) {

    if (shipLength == 1) return shipImages.boat;
    if (shipLength == 2) return shipImages.shipSmallDestroyed;
    if (shipLength == 3) return shipImages.shipMediumDestroyed;
    if (shipLength == 4) return shipImages.shipLargeDestroyed;
  }

  const shipImages = 
  {
    boat: ship1, 
    shipSmall: ship2A,
    shipSmallDestroyed: ship2B,
    shipMedium: ship3A,
    shipMediumDestroyed: ship3B,
    shipLarge: ship4A,
    shipLargeDestroyed: ship4B,
  }

  function setShipImage(shipImg, cell, shipLength, direction) {
    const ship = new Image();
    ship.src = shipImg;

    let whichSubBoard = cell.parentElement.parentElement.classList[0];

    if (direction === 'horizontal') cell.classList.add('imageHorizontal');
    else cell.classList.add('imageVertical');

    if (shipLength === 1) {
      cell.classList.add('boat');
    } else if (shipLength === 2) {
      cell.classList.add('smallShip');
    } else if (shipLength === 3) {
      cell.classList.add('mediumShip');
    } else cell.classList.add('largeShip');

    cell.append(ship);
  }

  function getCorrectPlayerDomBoard(whichSubBoard) {
    return whichSubBoard == 'subBoardPlayer' ? '.player' : '.enemy'
  }

  function setShips(whichSubBoard, placedShips) {

    let domParent = getCorrectPlayerDomBoard(whichSubBoard)

    placedShips.forEach(shipObj => {
      console.log(shipObj)
      let row = shipObj.coords[0][0];
      let col = shipObj.coords[0][1];
      let cell = document.querySelector(`${domParent} .sub [row="${row}"][col="${col}"]`)
      //empty the dom cell from the previous ship image before inserting a new one
      cell.textContent = '';

      let shipLength = shipObj.placedShip.getLength();
      let direction = shipObj.direction == 1 ? 'horizontal' : 'vertical';

      let shipImage;
      if (domParent === '.player') {
        shipImage = getPlayerShipImg(shipObj.placedShip, shipLength);
      } else shipImage = getSunkenEnemyShipImg(shipLength);

      setShipImage(shipImage, cell, shipLength, direction);
    });
  };

  function revealSunkenEnemyShip() {

  }

  function setMissImage(cell) {
    const missImage = new Image();
    missImage.src = watersplash;
    missImage.id = 'watersplashImg'
    cell.append(missImage);
  }

  function setHitImage(cell) {
    const hitImage = new Image();
    hitImage.src = explosion;
    hitImage.id = 'explosionImg'
    cell.append(hitImage);
  }

  function refreshBoard(domBoard, boardArray) {
    console.log(boardCells[domBoard]);
    boardCells[domBoard].forEach((cell) => {
      cell.textContent = '';
      let rowInt = cell.getAttribute('row');
      let colInt = cell.getAttribute('col'); 
      if (boardArray[rowInt][colInt] == 's' || boardArray[rowInt][colInt] == 'o') {
        setMissImage(cell)
      }
      else if (Array.isArray(boardArray[rowInt][colInt]) && boardArray[rowInt][colInt][1] == 'o') {
        setMissImage(cell);
      } else if (boardArray[rowInt][colInt] == 'x' || (Array.isArray(boardArray[rowInt][colInt]) && boardArray[rowInt][colInt][1] == 'x')) {
        setHitImage(cell)
      }
    }); 
  };

  return {initiateDOM, attachListeners, setShips, revealSunkenEnemyShip, refreshBoard}
};

export {displayHandler}