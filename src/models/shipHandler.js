const ship = function(length) {

  let hits = 0
  let imgIsSet = false;

  const hit = () => hits += 1;
  const setImg = () => imgIsSet = true;
  const isImgSet = () => imgIsSet

  const getLength = () => length
  const getHits = () => hits
  
  const isSunk = function() {
    if (hits >= length) return true
    return false
  } 

  return {hit, getLength, getHits, isSunk, setImg, isImgSet}
}

export {ship}