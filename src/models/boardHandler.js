import {ship} from "./shipHandler.js";
import { getSurroundingArea, getMarkers, getRandomNumber, isInBounds, isShip, HorizontalOrVertical, getCoordsCopy } from "../utilities.js";
import some from "lodash/some";
import isEqual from "lodash/isEqual";

const boardHandler = function() {
  
  let board = [];

  let createdShips = [];
  let placedShips = [];
  let sunkenShips = [];

  let sharedSurroundingCells = new Map();
  let cellsHit = [];

  //gameboard markers, like hit, miss and splashHits around ship when ship is struck
  const markers = getMarkers();

  const getGameBoard = () => board;

  const getCreatedShips = () => createdShips;
  const getPlacedShips = () => placedShips;
  const getSunkenShips = () => sunkenShips;

  const getCellsHit = () => cellsHit;
  const resetCellsHit = () => cellsHit = [];
  const getSharedSurroundingCells = () => sharedSurroundingCells;


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
      //let direction = HorizontalOrVertical(coords[0], coords[1]);
      let areCoordsValid = validPlacement(coords[0], coords[1])
      if (areCoordsValid) {
        createdShips[currentShip] = {
          createdShip: createdShips[currentShip], 
          coords: [coords[0], coords[1]],
          //direction: direction
        }
        setShip(
          //createdShips[currentShip].direction, 
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

    let isValid = validPlacement(frontCoords, rearCoords);
    if (isValid) {
      setShip(frontCoords, rearCoords, shipObj);
      return true
    }
    return false

  };

  const findPlacedShip = function(placedShips, shipObj) {
    return placedShips.find(ship => ship.placedShip == shipObj)
  }

  const nullifyCurrentShipArea = function(playerBoardObj, shipObj) {
    shipObj.shipArea.forEach((cell) => playerBoardObj[cell[0]][cell[1]] = null)
  };
   
  const emptyShipSurrounding = function(playerBoardObj, shipObj) {
    shipObj.shipSurroundingCells.forEach((cell) => {
      let strCell = JSON.stringify(cell);
      if (sharedSurroundingCells.has(strCell)) {
        sharedSurroundingCells.set(strCell, sharedSurroundingCells.get(strCell) -1)
        if (sharedSurroundingCells.get(strCell) == 1) {
          sharedSurroundingCells.delete(strCell)
        }
      } else playerBoardObj[cell[0]][cell[1]] = null;
    });
  };

  const updatePlacedShipValues = function(isInPlacedShips, frontCoords, rearCoords, shipArea, shipSurroundingCells) {
    isInPlacedShips.coords = [frontCoords, rearCoords],
    isInPlacedShips.shipArea = shipArea,
    isInPlacedShips.shipSurroundingCells = shipSurroundingCells
  }

  const setShip = function(frontCoords, rearCoords, shipObj) {

    /* We'll create copy of the actual coordinates here so 
    that the iterator won't modify the original ones */
    let frontCoordsCopy = getCoordsCopy(frontCoords)

    let direction = HorizontalOrVertical(frontCoords, rearCoords);

    let shipArea = [];
    let shipSurroundingCells = [];

    let currentSurrounding = getSurroundingArea(frontCoordsCopy);
    let rearCoordsSurrounding = getSurroundingArea(rearCoords);

    if (direction == 0) {
      shipSurroundingCells = (Object.values([
        currentSurrounding.north, 
        currentSurrounding.northEast, 
        currentSurrounding.northWest,
        rearCoordsSurrounding.south, 
        rearCoordsSurrounding.southEast, 
        rearCoordsSurrounding.southWest
      ]).filter(cell => isInBounds(cell)))

      placeSidesAndPartOfShip(0, currentSurrounding.west, currentSurrounding.east);

    } else {
        shipSurroundingCells = (Object.values([
          currentSurrounding.west, 
          currentSurrounding.northWest, 
          currentSurrounding.southWest,
          rearCoordsSurrounding.east, 
          rearCoordsSurrounding.northEast, 
          rearCoordsSurrounding.southEast
        ]).filter(cell => isInBounds(cell)))

      placeSidesAndPartOfShip(1, currentSurrounding.north, currentSurrounding.south)
    
    };

    directionIterator(shipSurroundingCells)

    function placeSidesAndPartOfShip(axis, side1, side2) {
      let side1coordsCopy = getCoordsCopy(side1);
      let side2coordsCopy = getCoordsCopy(side2);
      while (frontCoordsCopy[direction] <= rearCoords[direction]) {

        if (isInBounds(side1coordsCopy)) {
          shipSurroundingCells.push([side1coordsCopy[0], side1coordsCopy[1]])
          side1coordsCopy[axis] += 1
        }

        board[frontCoordsCopy[0]][frontCoordsCopy[1]] = shipObj
        shipArea.push([frontCoordsCopy[0], frontCoordsCopy[1]])
        frontCoordsCopy[direction] += 1

        if (isInBounds(side2coordsCopy)) {
          shipSurroundingCells.push([side2coordsCopy[0], side2coordsCopy[1]])
          side2coordsCopy[axis] += 1 
        };
      };
    };

    function directionIterator(surroundings) {
      surroundings.forEach(coords => {
        /* check if the current area is already some other shipObject's shipsurrounding area - if it is, 
        append to sharedSurroundingCells for us to access later when changing a ship position in
        ship placement modal */
        if (board[coords[0]][coords[1]] == markers.shipSurrounding) {
          //turn the coords to string first so we may use the array correctly as a key
          let strCoords = JSON.stringify(coords);
          if (!sharedSurroundingCells.has(strCoords)) {
            sharedSurroundingCells.set(strCoords, 2);
          } else sharedSurroundingCells.set(strCoords, sharedSurroundingCells.get(strCoords) +1)
        } else board[coords[0]][coords[1]] = markers.shipSurrounding

        console.log(sharedSurroundingCells)
        console.log(sharedSurroundingCells.get(coords))
      });
    };

    let isInPlacedShips = findPlacedShip(placedShips, shipObj)
    if (!isInPlacedShips) {
      placedShips.push(
        {
          placedShip: shipObj, 
          coords: [frontCoords, rearCoords], 
          direction, 
          shipArea,
          shipSurroundingCells
        });
        //console.log('ei löydy')
    }
      else updatePlacedShipValues(isInPlacedShips, frontCoords, rearCoords, shipArea, shipSurroundingCells)
  };

  const validPlacement = function(frontCoords, rearCoords) {

    let frontCoordsCopy = getCoordsCopy(frontCoords)

    function IsCoordsFormCorrect() {
      return ((frontCoords[0] == rearCoords[0] && frontCoords[1] < rearCoords[1])
            || (frontCoords[1] == rearCoords[1] && frontCoords[0] < rearCoords[0])
            || (frontCoords[1] == rearCoords[1] && frontCoords[0] == rearCoords[0])
      );
    };

    if (IsCoordsFormCorrect() == false) return false
    if (isInBounds(frontCoords) == false) return false
    if (isInBounds(rearCoords) == false) return false
    if (!cellIsNull(frontCoordsCopy)) return false
    if (!cellIsNull(rearCoords)) return false

    return true;
  };

  function cellIsNull(cellCoords) {
    return board[cellCoords[0]][cellCoords[1]] == null
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
    getSharedSurroundingCells,
    getRandomCoords, 
    validateAndPlace, 
    findPlacedShip,
    nullifyCurrentShipArea,
    emptyShipSurrounding,
    setShip,
    validPlacement,
    cellIsNull,
    receiveAttack
  };
};

/*let board = boardHandler();
board.buildBoard();
board.createShips();
let ship0 = ship(4);
let ship1 = ship(4);
board.validateAndPlace(ship1, [1,3], [1,6]);
board.validateAndPlace(ship0, [3,4], [3,6]);
board.getPlacedShips()
/*board.receiveAttack(6,3);
board.receiveAttack(6,2);
board.receiveAttack(6,4);
board.receiveAttack(6,5); */
//board.getGameBoard()
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