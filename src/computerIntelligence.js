import {
  getRandomNumber,
  getSurroundingArea,
  getMarkers,
  isInBounds,
  isShip,
} from './utilities.js';
import { shuffle } from 'lodash';

const computerIntelligence = function () {
  let struckShipCoords = [];

  let markers = getMarkers();

  const getStruckShipCoords = () => struckShipCoords;
  const addStruckShipCoords = (coords) => struckShipCoords.push(coords);
  const resetStruckShipCoords = () => (struckShipCoords = []);

  let struckShipSurroundings = [];
  const getStruckShipSurroundings = () => struckShipSurroundings;

  const getFirstOfStruckShipSurr = function (playerBoard) {
    let firstCell = struckShipSurroundings.shift();
    /* if the current firstCell in a shuffled struckShipSurroundings array is an
    hitSplash (i.e. cell which can't be struck anymore), we ignore it and take the
    next one until the valid surrounding cell is found. */
    while (playerBoard[firstCell[0]][firstCell[1]] == markers.hitSplash) {
      firstCell = struckShipSurroundings.shift();
    }
    return firstCell;
  };

  const addStruckShipSurroundings = function (hitCoords, playerBoard) {
    let surroundings = getSurroundingArea(hitCoords);
    let [north, east, south, west] = [
      surroundings.north,
      surroundings.east,
      surroundings.south,
      surroundings.west,
    ];
    /* from all the possible directions from the hit the computer can hit next, we 
    remove the ones which are already struck/touched or out of bounds so that computer knows which cells 
    are available to strike */
    let adjacentMoves = getPossibleAdjacentMoves(
      [north, east, south, west],
      playerBoard
    );
    /* then we randomize the order which the computer starts striking from the available adjacent cells */
    let shuffled = shuffle(adjacentMoves);
    struckShipSurroundings = [...struckShipSurroundings, ...shuffled];
  };

  const resetStruckShipSurroundings = () => (struckShipSurroundings = []);

  /* with availableMoves we have an array which has all the possible moves in the
  gameboard. Every time a player (computer or the human) makes a move, that 
  particular move gets removed from the array, effectively leaving less possible
  moves left */
  const availableMoves = [];
  const getAvailableMoves = () => availableMoves;

  const createAvailableMoves = () => {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        availableMoves.push([y, x]);
      }
    }
  };

  const refreshAvailableMoves = function (cellsHit) {
    cellsHit.forEach((coords) => {
      let index = availableMoves.findIndex(
        (subArr) => JSON.stringify(subArr) === JSON.stringify(coords)
      );
      if (index !== -1) {
        availableMoves.splice(index, 1);
      }
    });
  };

  const getMove = function () {
    let randomIndex = getRandomNumber(availableMoves.length);
    let fetchedCoords = availableMoves[randomIndex];
    return fetchedCoords;
  };

  const getPossibleAdjacentMoves = function (directions, playerBoard) {
    const validCells = function (coords) {
      if (isInBounds(coords)) {
        let cell = playerBoard[coords[0]][coords[1]];
        if (cell == markers.shipSurrounding || isShip(cell)) return coords;
      }
    };
    return directions.filter(validCells);
  };

  return {
    getStruckShipCoords,
    addStruckShipCoords,
    resetStruckShipCoords,
    getStruckShipSurroundings,
    getFirstOfStruckShipSurr,
    addStruckShipSurroundings,
    resetStruckShipSurroundings,
    getAvailableMoves,
    createAvailableMoves,
    refreshAvailableMoves,
    getMove,
  };
};

export { computerIntelligence };
