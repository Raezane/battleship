import {ship} from "./shipHandler.js"

const boardHandler = function() {
  let board = []
  let sunkenShips = [];

  const markers = {
    hit: 'x',
    miss: 'o',
    shipSurrounding: 'u'
  }

  const getGameBoard = () => board
  //const getSunkenShips

  const buildBoard = function() {
    for (let y = 0; y < 10; y++) {
      let arr = [];
      for (let x = 0; x < 10; x++) {
        arr.push(null)
      }
      board.push(arr)
    }
  }

  const shipSetter = function(ship, frontCoords, rearCoords) {

    /* first check if the selected area for the ship to be placed is not
    already occupied. We'll create copy of the actual coordinates here so 
    that the iterator won't modify the original ones */

    const getCoordsCopy = (coords) => [...coords];

    let frontCoordsCopy = getCoordsCopy(frontCoords)

    let surroundingArea = {
      north: [frontCoordsCopy[0]-1, frontCoordsCopy[1]],
      northEast: [frontCoordsCopy[0]-1, frontCoordsCopy[1]+1],
      east: [frontCoordsCopy[0], frontCoordsCopy[1]+1],
      southEast: [frontCoordsCopy[0]+1, frontCoordsCopy[1]+1],
      south: [frontCoordsCopy[0]+1, frontCoordsCopy[1]],
      southWest: [frontCoordsCopy[0]+1, frontCoordsCopy[1]-1],
      west: [frontCoordsCopy[0], frontCoordsCopy[1]-1],
      northWest: [frontCoordsCopy[0]-1, frontCoordsCopy[1]-1]
    };

    function setShip(direction, frontCoords, rearCoords) {

      if (direction == 0) {
        setNorthernSurrounding(surroundingArea.north, surroundingArea.northEast, surroundingArea.northWest)
        setVertically(surroundingArea.west, surroundingArea.east)
        setSouthernSurrounding(surroundingArea.south, surroundingArea.southEast, surroundingArea.southWest)
      } else {
        setWesternSurrounding(surroundingArea.west, surroundingArea.northWest, surroundingArea.southWest)
        setHorizontally(surroundingArea.north, surroundingArea.south)
        setEasternSurrounding(surroundingArea.east, surroundingArea.northEast, surroundingArea.southEast)
      }

      function setVertically(west, east) {
        let westCoordsCopy = getCoordsCopy(west);
        let eastCoordsCopy = getCoordsCopy(east);
        while (frontCoords[direction] <= rearCoords[direction]) {

          if (isInBounds(westCoordsCopy)) {
            board[westCoordsCopy[0]][westCoordsCopy[1]] = markers.shipSurrounding
            westCoordsCopy[0] += 1
          }

          board[frontCoords[0]][frontCoords[1]] = ship
          frontCoords[direction] += 1

          if (isInBounds(eastCoordsCopy)) {
            board[eastCoordsCopy[0]][eastCoordsCopy[1]] = markers.shipSurrounding
            eastCoordsCopy[0] += 1 
          }
        }
      }

      function setHorizontally(north, south) {
        let northCoordsCopy = getCoordsCopy(north);
        let southCoordsCopy = getCoordsCopy(south);
        while (frontCoords[direction] <= rearCoords[direction]) {

          if (isInBounds(northCoordsCopy)) {
            board[northCoordsCopy[0]][northCoordsCopy[1]] = markers.shipSurrounding
            northCoordsCopy[1] += 1
          }

          board[frontCoords[0]][frontCoords[1]] = ship
          frontCoords[direction] += 1

          if (isInBounds(southCoordsCopy)) {
            board[southCoordsCopy[0]][southCoordsCopy[1]] = markers.shipSurrounding
            southCoordsCopy[1] += 1 
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

    function isInBounds(shipCoords) {
      const [row, col] = shipCoords;
      return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
    }

    function validPlacement(direction) {

      function isSurroundingClear() {

        for (const key in surroundingArea) {
          let [row, col] = surroundingArea[key]
          try {
            if (board[row][col] && typeof board[row][col] === 'object') return false
          } catch (error) {
            /* if the current value is undefined (outside bounds), this catch-block catches it without 
            crashing the app */ 
            console.log(`the current value is outside board bounds and thus undefined`)
          }
        } return true
      }

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

  };

  const receiveAttack = function(y, x) {
    // check if the attacked square is empty by checking if square holds just a null
    if (board[y][x] == null) {
      board[y][x] = markers.miss;
    /* if not a number, then check if ship already resides in the square -> in other words, is the square a ship object. 
       If so, then hit the ship */
    } else if (typeof board[y][x] == 'object') {
      board[y][x].hit()
      board[y][x] = [board[y][x], markers.hit]
    } else if (board[y][x] == markers.shipSurrounding) {
      board[y][x] = [markers.shipSurrounding, markers.miss]
    }
  };

  return {getGameBoard, buildBoard, shipSetter, receiveAttack}

}

let board = boardHandler();
board.buildBoard();
let ship0 = ship(4);
let ship1 = ship(3);
let ship2 = ship(1);
board.shipSetter(ship0, [1,0], [1,3]);
board.shipSetter(ship1, [3,1], [5,1]);
board.shipSetter(ship2, [0,7], [0,7]);
board.getGameBoard()
board.receiveAttack(6,10)
board.receiveAttack(6,7)
board.getGameBoard()
ship1.getHits()


export {boardHandler}