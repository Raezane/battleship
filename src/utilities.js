//functions in this module are used by both displayHandler and boardHandler

const getSurroundingArea = function(coords) {
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

const getRandomNumber = function(num) {
  return Math.floor(Math.random() * num)
}

const isInBounds = function(coords) {
  const [row, col] = coords;
  return row >= 0 && row < 10 && col >= 0 && col < 10;
}

const isShip = function(boardEntry) {
  if (boardEntry !== null && typeof boardEntry === 'object' && Array.isArray(boardEntry) == false) return true
  return false
}

export {
  getSurroundingArea,
  getRandomNumber,
  isInBounds,
  isShip
}

