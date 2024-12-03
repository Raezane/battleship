const ship = function(length) {

  let hits = 0

  const hit = () => hits += 1

  const getLength = () => length
  const getHits = () => hits
  
  const isSunk = function() {
    if (hits >= length) return true
    return false
  } 

  return {hit, getLength, getHits, isSunk}
}

export {ship}