import { gameController } from "../controller.js";
import { boardHandler } from "../models/boardHandler.js";
import ship1 from "../assets/images/boat1.png";
import ship2A from "../assets/images/ship_small_body.png";
import ship2B from "../assets/images/ship_small_body_destroyed.png";
import ship3A from "../assets/images/ship_medium_body.png";
import ship3B from "../assets/images/ship_medium_body_destroyed.png";
import ship4A from "../assets/images/ship_large_body.png";
import ship4B from "../assets/images/ship_large_body_destroyed.png";

const displayHandler = function() {

  /* we declare a general board object here so that we may use its 
  helper functions */
  let boardObject = boardHandler();

  //declare interactive dom elements
  let playerBoardcells, enemyBoardCells

  document.addEventListener('DOMContentLoaded', () => {
    initiateDOM();
    //initiateImages()
    attachListeners();
  });

  function initiateDOM() {
    playerBoardcells = document.querySelectorAll('.player div');
    enemyBoardCells = document.querySelectorAll('.enemy div');
  }

  /* function initiateImages() {
 
  } */
 
  function attachListeners() {

  }

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
      let surrounding = boardObject.getSurroundingArea([rowInt, colInt])

      /* we'll also need to check if the received surroundingCoords are in bounds
      before we check in which direction should the ship image be placed */
      if (boardObject.isInBounds(surrounding.east)) {
        if (boardObject.isShip(board[surrounding.south[0]][surrounding.south[1]])) {
          direction = 'vertical';
        } 
      } else direction = 'horizontal';
    } else {
      // if the shipLength is only 1, we may set a random direction for it
        let randomDirection = boardObject.getRandomNumber(2);
        if (randomDirection == 0) direction = 'vertical';
        else direction = 'horizontal';
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

  function setImage(shipImg, cell, direction) {
    const ship = new Image();
    ship.src = shipImg;

    //JATKA TÄSTÄ!
    cell.classList.add('placedShip');
    cell.append(ship);
  }

  function informShipObj(shipObj) {
    shipObj.setImg();
  }

  function boardRefresher(board, whichOne) {

    let boardCells;
    whichOne === 'player' ? boardCells = playerBoardcells : boardCells = enemyBoardCells;

    boardCells.forEach(cell => {
      let row = cell.getAttribute('row');
      let col = cell.getAttribute('col');
      if (boardObject.isShip(board[row][col]) && board[row][col].isImgSet() == false) {
        let directionAndLength = getDirectionAndLength(board[row][col], board, row, col);
        let shipLength = directionAndLength[1];
        let shipImage = getProperShipImg(board[row][col], shipLength);
        setImage(shipImage, cell, directionAndLength[0]);
        informShipObj(board[row][col])
      };
    });
  };

  return {initiateDOM, attachListeners, boardRefresher}
};

export {displayHandler}