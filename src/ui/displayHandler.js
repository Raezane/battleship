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
    boardCells['subBoardPlayer'] = document.querySelectorAll('.sub > div');
    boardCells['mainBoardPlayer'] = document.querySelectorAll('.player > div:nth-child(n+2)');
    //boardCells['subBoardEnemy'] = document.querySelectorAll('.enemy > div');
    //boardCells['mainBoardEnemy'] = document.querySelectorAll('.enemy > div:nth-child(n+2)');
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
    //setBoardCellListeners(boardCells['mainBoardEnemy']);
  };

  function getClickedCell() {
    let clickedBoard = this.parentNode.classList[0];
    let row = this.getAttribute('row');
    let col = this.getAttribute('col');
    controller.handleAttack(clickedBoard, row, col);
  };

  function getProperShipImg(shipObject, shipLength) {
    let isSunk = shipObject.isSunk();

    if (shipLength == 1 && isSunk == false) return shipImages.boat;
    if (shipLength == 2 && isSunk == false) return shipImages.shipSmall;
    if (shipLength == 2 && isSunk) return shipImages.shipSmallDestroyed;
    if (shipLength == 3 && isSunk == false) return shipImages.shipMedium;
    if (shipLength == 3 && isSunk) return shipImages.shipMediumDestroyed;
    if (shipLength == 4 && isSunk == false) return shipImages.shipLarge;
    if (shipLength == 4 && isSunk) return shipImages.shipLargeDestroyed;
  }

  function getDirectionAndLength(shipObj, board, row, col) {
    /* before we may use row and column to get the surrounding coords, 
    we need to parse them to number first because they both are still strings
    at this moment when they've been fetched from dom as data attributes */
    let rowInt = parseInt(row, 10);
    let colInt = parseInt(col, 10);
    let direction;
    let shipLength = shipObj.getLength();
    
    if (shipLength > 1) {
      let surrounding = getSurroundingArea([rowInt, colInt])

      /* we'll also need to check if the received surroundingCoords are in bounds
      before we check in which direction should the ship image be placed */
      if (isInBounds(surrounding.east)) {
        if (isShip(board[surrounding.east[0]][surrounding.east[1]])) {
          direction = 'horizontal';
        } else direction = 'vertical';
      } 
    } else {
      // if the shipLength is only 1, we may set a random direction for it
        direction = 'vertical';
      };

    return [direction, shipLength];
  };

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

  function informShipObj(shipObj) {
    shipObj.setImg();
  }

  function setPlayerShips(boardArray) {

    boardCells['subBoardPlayer'].forEach(cell => {
      let row = cell.getAttribute('row');
      let col = cell.getAttribute('col');
      if (isShip(boardArray[row][col]) && boardArray[row][col].isImgSet() == false) {
        
        let directionAndLength = getDirectionAndLength(boardArray[row][col], boardArray, row, col);
        let shipLength = directionAndLength[1];
        let direction = directionAndLength[0];
        let shipImage = getProperShipImg(boardArray[row][col], shipLength);
        
        setShipImage(shipImage, cell, shipLength, direction);
        informShipObj(boardArray[row][col])
      };
    });
  };

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

  return {initiateDOM, attachListeners, setPlayerShips, refreshBoard}
};

export {displayHandler}