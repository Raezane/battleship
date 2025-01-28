import {ship} from "./shipHandler.js";
import { getSurroundingArea, getMarkers, getRandomNumber, isInBounds, isShip, HorizontalOrVertical, getCoordsCopy } from "../utilities.js";

const boardHandler = function() {
  let board = [];
  let createdShips = [];
  let placedShips = [];
  let cellsHit = [];
  let sunkenShips = [];

  //gameboard markers, like hit, miss and splashHits around ship when ship is struck
  const markers = getMarkers();

  const getGameBoard = () => board;

  const getCreatedShips = () => createdShips;
  const getPlacedShips = () => placedShips;

  const getCellsHit = () => cellsHit;
  const resetCellsHit = () => cellsHit = [];

  const getSunkenShips = () => sunkenShips;

  const areAllSunk = function() {
    if (sunkenShips.length >= 10) return true
    return false
  }

  /* buildBoard function creates the gameboard and with the same iteration, 
  also returns available moves for each player. */
  const buildBoard = function() {
    for (let y = 0; y < 10; y++) {
      let arr = [];
      for (let x = 0; x < 10; x++) {
        arr.push(null);
      }
      board.push(arr);
    };
  };

  const createShips = function() {
    let shipLengths = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    shipLengths.forEach(shipLength => createdShips.push(ship(shipLength)));
  };

  const setShipsRandomly = function() {
    let currentShip = 0
    while (currentShip < 10) {
      let coords = getRandomCoords(createdShips[currentShip]);
      let direction = HorizontalOrVertical(coords[0], coords[1]);
      let areCoordsValid = validPlacement(direction, coords[0], coords[1])
      if (areCoordsValid) {
        createdShips[currentShip] = {
          createdShip: createdShips[currentShip], 
          coords: [coords[0], coords[1]],
          direction: direction
        }
        setShip(
          createdShips[currentShip].direction, 
          createdShips[currentShip].coords[0], 
          createdShips[currentShip].coords[1], 
          createdShips[currentShip].createdShip
        );
        currentShip += 1
      };
    };
  }

  const getRandomCoords = function(shipObj) {

    let randomCoords = [[], []]

    let lengthOfShip = shipObj.getLength()
    let direction = getRandomNumber(2)
    /* here we calculate the possible start area for the ship to be set by deducting current ship's length
    from board length. We need to do this so that part of the ship won't be outside bounds */
    let possibleArea = board.length - lengthOfShip +1
    let shipStart = getRandomNumber(possibleArea)
    
    randomCoords[0].push(shipStart)
    randomCoords[1].push(shipStart + lengthOfShip -1)

    let colOrRow = getRandomNumber(10)

    if (direction == 0) {
      randomCoords[0].push(colOrRow)
      randomCoords[1].push(colOrRow)
    } else {
      randomCoords[0].unshift(colOrRow)
      randomCoords[1].unshift(colOrRow)
    }

    return randomCoords
  }

  const validateAndPlace = function(shipObj, frontCoords, rearCoords) {

    let direction = HorizontalOrVertical(frontCoords, rearCoords)
    let isValid = validPlacement(direction, frontCoords, rearCoords);
    if (isValid) setShip(direction, frontCoords, rearCoords, shipObj);
    else return false

  };

  const setShip = function(direction, frontCoords, rearCoords, shipObj) {

    /* first check if the selected area for the ship to be placed is not
    already occupied. We'll create copy of the actual coordinates here so 
    that the iterator won't modify the original ones */
    let frontCoordsCopy = getCoordsCopy(frontCoords)

    placedShips.push({placedShip: shipObj, coords: [frontCoords, rearCoords], direction})

    let surrounding = getSurroundingArea(frontCoords)

    if (direction == 0) {
      setNorthernSurrounding(surrounding.north, surrounding.northEast, surrounding.northWest)
      placeSidesAndPartOfShip(0, surrounding.west, surrounding.east)
      setSouthernSurrounding(surrounding.south, surrounding.southEast, surrounding.southWest)
    } else {
      setWesternSurrounding(surrounding.west, surrounding.northWest, surrounding.southWest)
      placeSidesAndPartOfShip(1, surrounding.north, surrounding.south)
      setEasternSurrounding(surrounding.east, surrounding.northEast, surrounding.southEast)
    }

    function placeSidesAndPartOfShip(axis, side1, side2) {
      let side1coordsCopy = getCoordsCopy(side1);
      let side2coordsCopy = getCoordsCopy(side2);
      while (frontCoordsCopy[direction] <= rearCoords[direction]) {

        if (isInBounds(side1coordsCopy)) {
          board[side1coordsCopy[0]][side1coordsCopy[1]] = markers.shipSurrounding
          side1coordsCopy[axis] += 1
        }

        board[frontCoordsCopy[0]][frontCoordsCopy[1]] = shipObj
        frontCoordsCopy[direction] += 1

        if (isInBounds(side2coordsCopy)) {
          board[side2coordsCopy[0]][side2coordsCopy[1]] = markers.shipSurrounding
          side2coordsCopy[axis] += 1 
        }
      }
    }

    function setNorthernSurrounding(...surroundings) {
      directionIterator(surroundings)
    }

    function setSouthernSurrounding(...surroundings) {
      let southernCoords = 
      [
        [frontCoordsCopy[direction], surroundings[0][1]], 
        [frontCoordsCopy[direction], surroundings[1][1]],
        [frontCoordsCopy[direction], surroundings[2][1]],
      ] 

      directionIterator(southernCoords)
    }

    function setWesternSurrounding(...surroundings) {
      directionIterator(surroundings)
    }

    function setEasternSurrounding(...surroundings) {
      let easternCoords = [
        [surroundings[0][0], frontCoordsCopy[direction]], 
        [surroundings[1][0], frontCoordsCopy[direction]],
        [surroundings[2][0], frontCoordsCopy[direction]]
      ]
      directionIterator(easternCoords)
    };

    function directionIterator(surroundings) {
      surroundings.forEach(coords => {
        if (isInBounds(coords)) {
          board[coords[0]][coords[1]] = markers.shipSurrounding
        };
      });
    };
  };

  const validPlacement = function(direction, frontCoords, rearCoords) {

    let frontCoordsCopy = getCoordsCopy(frontCoords)

    function IsCoordsFormCorrect() {
      return ((frontCoords[0] == rearCoords[0] && frontCoords[1] < rearCoords[1])
            || (frontCoords[1] == rearCoords[1] && frontCoords[0] < rearCoords[0])
            || (frontCoords[1] == rearCoords[1] && frontCoords[0] == rearCoords[0])
      )
    }

    function isSurroundingClear() {

      let surrounding = getSurroundingArea(frontCoordsCopy)

      for (const key in surrounding) {
        let [row, col] = surrounding[key]
        try {
          if (isShip(board[row][col])) return false
        } catch (error) {
          /* if the current value is undefined (outside bounds), this catch-block catches it without 
          crashing the app */ 
          console.log(`the current value is outside board bounds and thus undefined`)
        }
      } return true
    }

    if (IsCoordsFormCorrect() == false) return false
    if (isInBounds(frontCoords) == false) return false
    if (isInBounds(rearCoords) == false) return false

    while (frontCoordsCopy[direction] <= rearCoords[direction]) {
        // check by iterating if the area where ship is placed is null and there aren't ships straight next to it.
        if (board[frontCoordsCopy[0]][frontCoordsCopy[1]] == null && isSurroundingClear()) {
          frontCoordsCopy[direction] += 1;    
          } else return false  
        };
      return true;
  };

  const receiveAttack = function(y, x) {

    function attackMissed() {
      board[y][x] = markers.miss;
      markCellAsTouched([y, x]);
    }

    function closeCall() {
      board[y][x] = [markers.shipSurrounding, markers.miss];
      markCellAsTouched([y, x])
    };

    function attackHit() {
      board[y][x].hit();
      board[y][x] = [board[y][x], markers.hit];
      markCellAsTouched([y, x])

      let surrounding = getSurroundingArea([y, x]);
      let diagonals = [surrounding.northEast, surrounding.southEast, surrounding.southWest, surrounding.northWest]
      splashSurrounding(diagonals);

      if (checkIfSunk(board[y][x][0])) {
        let shipFrontAndRear = getShipEndsCoords(board[y][x][0]);
        let frontSurrounding = getSurroundingArea(shipFrontAndRear[0]);
        let rearSurrounding = getSurroundingArea(shipFrontAndRear[1]);

        splashShipEnds(frontSurrounding, rearSurrounding);
        
        areAllSunk();
      };
    };

    function getShipEndsCoords(shipObj) {
      for (let obj of placedShips) {
        if (shipObj === obj.placedShip) return obj.coords
      }
    }

    function splashSurrounding(diagonals) {
      diagonals.forEach((cell) => {
        if (isInBounds(cell)) {
          board[cell[0]][cell[1]] = markers.hitSplash
          markCellAsTouched(cell);
        };
      });
    };

    function splashShipEnds(frontSurrounding, rearSurrounding) {
      let frontVerAndHorSides = [frontSurrounding.north, frontSurrounding.east, frontSurrounding.south, frontSurrounding.west];
      let rearVerAndHorSides = [rearSurrounding.north, rearSurrounding.east, rearSurrounding.south, rearSurrounding.west];
      let combined = [...frontVerAndHorSides, ...rearVerAndHorSides]

      combined.forEach((cell) => {
        if (isInBounds(cell) && (board[cell[0]][cell[1]] == markers.shipSurrounding)) {
          board[cell[0]][cell[1]] = markers.hitSplash;
          markCellAsTouched(cell);
        };
      });
    };

    function checkIfSunk(thisShip) {
      if (thisShip.isSunk()) {
        let sunkenShip = getSunkenShip(thisShip);
        sunkenShips.push(sunkenShip);
        return true
      };
    };

    function getSunkenShip(shipObj) {
      for (let obj of placedShips) {
        if (obj.placedShip === shipObj) return obj
      }
    }

    function markCellAsTouched(cell) {
      if (cellsHit.includes(cell) == false) {
        cellsHit.push(cell);
      };
    }

    // check if the attacked square is empty by checking if square holds just a null
    if (board[y][x] == null) {
      attackMissed();
      //also a miss, but hit to ship surrounding
    } else if (board[y][x] == markers.shipSurrounding) {
      closeCall();
    /* if not a number, then check if ship already resides in the square -> 
    in other words, is the square a ship object. If so, then hit the ship */
    } else if (isShip(board[y][x])) {
      attackHit();
      return [y, x];
    } return false
  };

  return {
    getGameBoard, 
    getSunkenShips, 
    areAllSunk, 
    buildBoard, 
    createShips, 
    setShipsRandomly, 
    getCreatedShips,
    getPlacedShips, 
    getCellsHit,
    resetCellsHit,
    getRandomCoords, 
    validateAndPlace, 
    receiveAttack
  };
};

let board = boardHandler();
board.buildBoard();
board.createShips();
let ship0 = ship(4);
let ship1 = ship(4);
board.validateAndPlace(ship1, [1,8], [4,8]);
board.validateAndPlace(ship0, [6,2], [6,5]);
/*board.receiveAttack(6,3);
board.receiveAttack(6,2);
board.receiveAttack(6,4);
board.receiveAttack(6,5); */
board.getGameBoard()
//let rndCoords = board.getRandomCoords(ship0)
//board.setCreatedShips()
//board.getGameBoard()
/* board.getShips();
let ship0 = ship(4);
let ship1 = ship(3);
let ship2 = ship(3);
let ship3 = ship(1);
let rndCoords = board.getRandomCoords(ship2)
board.shipSetter(ship0, [1,0], [1,3]);
board.shipSetter(ship1, [3,1], [5,1]);
board.shipSetter(ship2, rndCoords[0], rndCoords[1]);
board.shipSetter(ship3, [0,7], [0,7]);
board.getGameBoard()
board.receiveAttack(0,7)
board.receiveAttack(4,1)
board.receiveAttack(8,3)
board.receiveAttack(6,6)
board.getGameBoard()
ship1.getHits() */


export {boardHandler}