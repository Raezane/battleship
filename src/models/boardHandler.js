import {ship} from "./shipHandler.js"

const boardHandler = function() {
  let board = [];
  let ships = [];
  let sunkenShips = [];

  const markers = {
    hit: 'x',
    miss: 'o',
    shipSurrounding: 'u'
  }

  const getGameBoard = () => board;
  const getShips = () => ships;
  const getSunkenShips = () => sunkenShips;

  const areAllSunk = function() {
    if (sunkenShips.length >= 10) return true
    return false
  }

  const buildBoard = function() {
    for (let y = 0; y < 10; y++) {
      let arr = [];
      for (let x = 0; x < 10; x++) {
        arr.push(null)
      }
      board.push(arr)
    };
  };

  const createShips = function() {
    let shipLengths = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    shipLengths.forEach(shipLength => ships.push(ship(shipLength)));
  };

  const setCreatedShips = function() {
    let currentShip = 0
    while (currentShip < 10) {
      let coords = randomiseCoords(ships[currentShip]);
      
      if (shipSetter(ships[currentShip], coords[0], coords[1]) !== false) currentShip += 1
    };
  };

  const randomiseCoords = function(shipObj) {

    let randomCoords = [[], []]

    function getRandomNumber(num) {
      return Math.floor(Math.random() * num)
    }

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

  const shipSetter = function(shipObj, frontCoords, rearCoords) {

    /* first check if the selected area for the ship to be placed is not
    already occupied. We'll create copy of the actual coordinates here so 
    that the iterator won't modify the original ones */

    const getCoordsCopy = (coords) => [...coords];

    let frontCoordsCopy = getCoordsCopy(frontCoords)

    function getSurroundingArea(coords) {
      let surroundingArea = {
        north: [coords[0]-1, coords[1]],
        northEast: [coords[0]-1, coords[1]+1],
        east: [coords[0], coords[1]+1],
        southEast: [coords[0]+1, coords[1]+1],
        south: [coords[0]+1, coords[1]],
        southWest: [coords[0]+1, coords[1]-1],
        west: [coords[0], coords[1]-1],
        northWest: [coords[0]-1, coords[1]-1]
      }
      return surroundingArea
    }

    function setShip(direction, frontCoords, rearCoords) {

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
        while (frontCoords[direction] <= rearCoords[direction]) {

          if (isInBounds(side1coordsCopy)) {
            board[side1coordsCopy[0]][side1coordsCopy[1]] = markers.shipSurrounding
            side1coordsCopy[axis] += 1
          }

          board[frontCoords[0]][frontCoords[1]] = shipObj
          frontCoords[direction] += 1

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
          [frontCoords[direction], surroundings[0][1]], 
          [frontCoords[direction], surroundings[1][1]],
          [frontCoords[direction], surroundings[2][1]],
        ] 

        directionIterator(southernCoords)
      }

      function setWesternSurrounding(...surroundings) {
        directionIterator(surroundings)
      }

      function setEasternSurrounding(...surroundings) {
        let easternCoords = [
          [surroundings[0][0], frontCoords[direction]], 
          [surroundings[1][0], frontCoords[direction]],
          [surroundings[2][0], frontCoords[direction]]
        ]
        directionIterator(easternCoords)
      }
    }

    function directionIterator(surroundings) {
      surroundings.forEach(coords => {
        if (isInBounds(coords)) {
          board[coords[0]][coords[1]] = markers.shipSurrounding
        }
      });
    }

    function isInBounds(coords) {
      const [row, col] = coords;
      return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
    }

    function validPlacement(direction) {

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
            if (board[row][col] && typeof board[row][col] === 'object') return false
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

    function HorizontalOrVertical(callback) {
      //here we give direction parameter as a number to callback function; 0 is vertical, 1 is horizontal
      if (frontCoords[0] < rearCoords[0]) {
        return callback(0, frontCoords, rearCoords)
      } else if (frontCoords[1] < rearCoords[1]) {
        return callback(1, frontCoords, rearCoords)
        //if neither of above applies, then check if ship is the smallest one which takes only one cell
      } else if (JSON.stringify(frontCoords) === JSON.stringify(rearCoords)) {
        return callback(1, frontCoords, rearCoords)
      }
    }

    let isValid = HorizontalOrVertical(validPlacement);
    if (isValid) HorizontalOrVertical(setShip);
    else return false

  };

  const receiveAttack = function(y, x) {

    function attackMissed() {
      board[y][x] = markers.miss;
    }

    function attackHit() {
      board[y][x].hit();
      board[y][x] = [board[y][x], markers.hit];
      checkIfSunk(board[y][x][0])
    };

    function closeCall() {
      board[y][x] = [markers.shipSurrounding, markers.miss];
    };

    function checkIfSunk(thisShip) {
      if (thisShip.isSunk()) {
        sunkenShips.push(thisShip);
        areAllSunk()
      };
    };

    // check if the attacked square is empty by checking if square holds just a null
    if (board[y][x] == null) {
      attackMissed();
      //also a miss, but hit to ship surrounding
    } else if (board[y][x] == markers.shipSurrounding) {
      closeCall();
    /* if not a number, then check if ship already resides in the square -> in other words, is the square a ship object. 
      If so, then hit the ship */
    } else if (typeof board[y][x] == 'object') {
      attackHit();
    } 
  };

  return {getGameBoard, getSunkenShips, areAllSunk, buildBoard, createShips, setCreatedShips, getShips, randomiseCoords, shipSetter, receiveAttack}

}

let board = boardHandler();
board.buildBoard();
board.createShips();
//let ship0 = ship(4);
//let rndCoords = board.randomiseCoords(ship0)
board.setCreatedShips()
board.getGameBoard()
/* board.getShips();
let ship0 = ship(4);
let ship1 = ship(3);
let ship2 = ship(3);
let ship3 = ship(1);
let rndCoords = board.randomiseCoords(ship2)
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