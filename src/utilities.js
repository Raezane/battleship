//functions in this module are utilities used widely by other modules

const getSurroundingArea = function (coords) {
  let surroundingArea = {
    north: [coords[0] - 1, coords[1]],
    northEast: [coords[0] - 1, coords[1] + 1],
    east: [coords[0], coords[1] + 1],
    southEast: [coords[0] + 1, coords[1] + 1],
    south: [coords[0] + 1, coords[1]],
    southWest: [coords[0] + 1, coords[1] - 1],
    west: [coords[0], coords[1] - 1],
    northWest: [coords[0] - 1, coords[1] - 1],
  };
  return surroundingArea;
};

// markers to the internal game board
const getMarkers = function () {
  const markers = {
    hit: 'x',
    hitSplash: 's',
    miss: 'o',
    shipSurrounding: 'u',
  };
  return markers;
};

const getRandomNumber = function (num) {
  return Math.floor(Math.random() * num);
};

const isInBounds = function (coords) {
  const [row, col] = coords;
  return row >= 0 && row < 10 && col >= 0 && col < 10;
};

const isShip = function (boardEntry) {
  if (
    boardEntry !== null &&
    typeof boardEntry === 'object' &&
    Array.isArray(boardEntry) == false
  )
    return true;
  return false;
};

const HorizontalOrVertical = function (frontCoords, rearCoords) {
  //0 means the ship is to be vertical, 1 when horizontal
  if (frontCoords[0] < rearCoords[0]) return 0;
  else if (frontCoords[1] < rearCoords[1]) return 1;
  else return 0;
};

const getCoordsCopy = (coords) => [...coords];

export {
  getSurroundingArea,
  getMarkers,
  getRandomNumber,
  isInBounds,
  isShip,
  HorizontalOrVertical,
  getCoordsCopy,
};
