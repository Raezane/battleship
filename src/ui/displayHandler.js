import {currentAreaAvailable, handlePlacement, handleTurn, handleAttack } from "../controller.js";

//ship models
import ship1 from "../assets/images/boat1.png";
import ship2A from "../assets/images/ship_small_body.png";
import ship2B from "../assets/images/ship_small_body_destroyed.png";
import ship3A from "../assets/images/ship_medium_body.png";
import ship3B from "../assets/images/ship_medium_body_destroyed.png";
import ship4A from "../assets/images/ship_large_body.png";
import ship4B from "../assets/images/ship_large_body_destroyed.png";

//explosion and misshit models
import explosion from "../assets/images/explosion.png";
import watersplash from "../assets/images/watersplash.png";

const displayHandler = function() {

  let resolveClick;

  let dragged;

  let imagePos;

  let mouseDownPosX;
  let mouseDownPosY;

  //distances to every edge of the image where the image is clicked from
  let distanceToTopEdge;
  let distanceToRightEdge;
  let distanceToBottomEdge;
  let distanceToLeftEdge;

  let liveTopEdge;
  let liveRightEdge;
  let liveBottomEdge;
  let liveLeftEdge;

  let x; 
  let y;

  let headerToBeHidden;
  let headertoBeShown;

  let horizontalDraggableShips = new Set();
  let verticalDraggableShips = {}

  let boardCells = {
    'shipSetterBoard': null,
    'subCellsPlayer': null,
    'mainCellsPlayer': null,
    'playerBoardParent': null,
    'subCellsEnemy': null,
    'mainCellsEnemy': null,
    'enemyBoardParent': null,
  }

  let transformableTitles = {
    'gameEndStatus': null,
    'askNewRound': null,
    'yourTurn': null,
    'enemyTurn': null
  }

  let otherElements = {
    'gameTable': null,
    'choicesParent': null,
    'yesButton': null,
    'noButton': null
  }

  const gethorizontalDraggableShips = () => horizontalDraggableShips;
  const getVerticalDraggableShips = () => verticalDraggableShips;

  const initiateHorizontalDraggableShips = function() {
    horizontalDraggableShips.add(document.querySelector('.big1'));
    horizontalDraggableShips.add(document.querySelector('.medium1'));
    horizontalDraggableShips.add(document.querySelector('.medium2'));
    horizontalDraggableShips.add(document.querySelector('.small1'));
    horizontalDraggableShips.add(document.querySelector('.small2'));
    horizontalDraggableShips.add(document.querySelector('.small3'));
    horizontalDraggableShips.add(document.querySelector('.boat1'));
    horizontalDraggableShips.add(document.querySelector('.boat2'));
    horizontalDraggableShips.add(document.querySelector('.boat3'));
    horizontalDraggableShips.add(document.querySelector('.boat4'));
  }

  const createVerticalDraggableShips = function() {

    const bigShipVertical = new Image();
    bigShipVertical.src = ship4A;
    bigShipVertical.classList.add('bigship', 'vertical', 'big1');
    bigShipVertical.setAttribute('data-shipsize', 4)
    verticalDraggableShips['big1'] = bigShipVertical

    const mediumShipVertical1 = new Image();
    mediumShipVertical1.src = ship3A;
    mediumShipVertical1.classList.add('mediumship', 'vertical', 'medium1');
    mediumShipVertical1.setAttribute('data-shipsize', 3)
    verticalDraggableShips['medium1'] = mediumShipVertical1


    const mediumShipVertical2 = new Image();
    mediumShipVertical2.src = ship3A;
    mediumShipVertical2.classList.add('mediumship', 'vertical', 'medium2');
    mediumShipVertical1.setAttribute('data-shipsize', 3)
    verticalDraggableShips['medium2'] = mediumShipVertical2


    const smallShipVertical1 = new Image();
    smallShipVertical1.src = ship2A;
    smallShipVertical1.classList.add('smallship', 'vertical', 'small1');
    smallShipVertical1.setAttribute('data-shipsize', 2)
    verticalDraggableShips['small1'] = smallShipVertical1


    const smallShipVertical2 = new Image();
    smallShipVertical2.src = ship2A;
    smallShipVertical2.classList.add('smallship', 'vertical', 'small2');
    smallShipVertical1.setAttribute('data-shipsize', 2)
    verticalDraggableShips['small2'] = smallShipVertical2


    const smallShipVertical3 = new Image();
    smallShipVertical3.src = ship2A;
    smallShipVertical3.classList.add('smallship', 'vertical', 'small3');
    smallShipVertical3.setAttribute('data-shipsize', 2)
    verticalDraggableShips['small3'] = smallShipVertical3

  }

  const initiateBoardcells = function() {
    boardCells['shipSetterBoardCells'] = document.querySelectorAll('.placement div');
    boardCells['subCellsPlayer'] = document.querySelectorAll('.player .sub > div');
    boardCells['mainCellsPlayer'] = document.querySelectorAll('.player > div:nth-child(n+2)');
    boardCells['playerBoardParent'] = document.querySelector('.player');
    boardCells['subCellsEnemy'] = document.querySelectorAll('.enemy .sub > div');
    boardCells['mainCellsEnemy'] = document.querySelectorAll('.enemy > div:nth-child(n+2)');
    boardCells['enemyBoardParent'] = document.querySelector('.enemy');
  }

  const initiateTitles = function() {
    transformableTitles['gameEndStatus'] = document.querySelector('.upperheaders h2');
    transformableTitles['askNewRound'] = document.querySelector('.upperheaders h3');
    transformableTitles['yourTurn'] = document.querySelector('.yourturn');
    transformableTitles['enemyTurn'] = document.querySelector('.enemyturn');
  }

  const initiateOtherElements = function() {
    otherElements['gameTable'] = document.querySelector('#gametable');
    otherElements['choicesParent'] = document.querySelector('.choices');
    otherElements['yesButton'] = document.querySelector('.choices button:first-child');
    otherElements['noButton'] = document.querySelector('.choices button:nth-child(2)');
  }

  const initiateDOM = function() {
    initiateHorizontalDraggableShips();
    initiateBoardcells();
    createVerticalDraggableShips();
    initiateTitles();
    initiateOtherElements();
  }

  const makePlayerBoardClickable = function() {
    boardCells['playerBoardParent'].classList.remove('non-clickable');
  }

  const makePlayerBoardUnClickable = function() {
    boardCells['playerBoardParent'].classList.add('non-clickable');
  }

  const makeEnemyBoardClickable = function() {
    boardCells['enemyBoardParent'].classList.remove('non-clickable');
  }

  const makeEnemyBoardUnClickable = function() {
    boardCells['enemyBoardParent'].classList.add('non-clickable');
  }

  const setDraggedElement = function(e) {
    dragged = e.target;
  };

  const setImageAndMouseDownPosition = function(e) {
    imagePos = dragged.getBoundingClientRect();
    mouseDownPosX = e.clientX;
    mouseDownPosY = e.clientY;
  };

  const setMouseDownDistToImgEdges = function() {
    distanceToTopEdge = mouseDownPosY - imagePos.top;
    distanceToRightEdge = imagePos.right - mouseDownPosX;
    distanceToBottomEdge = imagePos.bottom - mouseDownPosY;
    distanceToLeftEdge = mouseDownPosX - imagePos.left;
  };

  const setCursorTracker = function(e) {
    [x, y] = [e.clientX, e.clientY];
  };

  const setImgLivePosition = function(e) {
    liveTopEdge = (y - distanceToTopEdge) +5;
    liveRightEdge = (x + distanceToRightEdge) -10;
    liveBottomEdge = (y + distanceToBottomEdge) -5;
    liveLeftEdge = (x - distanceToLeftEdge) +10;
  }

  const doesImgAndCellIntercect = function(cellPos)  {
    return (
      cellPos.right > liveLeftEdge &&
      cellPos.left < liveRightEdge &&
      cellPos.top < liveBottomEdge &&
      cellPos.bottom > liveTopEdge
    );
  };

  const shipCurrentlyOutOfBounds = function(cell) {
    cell.classList.remove('validPlacement');
    cell.classList.add('invalidPlacement');
  }

  const shipCurrentlyInBounds = function(cell) {
    cell.classList.remove('invalidPlacement');
    cell.classList.add('validPlacement');
  }

  const removeValidityStyling = function(cell) {
    cell.classList.remove('invalidPlacement');
    cell.classList.remove('validPlacement');
  }

  //JATKA TÄSTÄ
    //JATKA TÄSTÄ
      //JATKA TÄSTÄ
        //JATKA TÄSTÄ
          //JATKA TÄSTÄ
            //JATKA TÄSTÄ
              //JATKA TÄSTÄ
                //JATKA TÄSTÄ
                  //JATKA TÄSTÄ
                    //JATKA TÄSTÄ
                      //JATKA TÄSTÄ
                        //JATKA TÄSTÄ
                          //JATKA TÄSTÄ
                            //JATKA TÄSTÄ
                              //JATKA TÄSTÄ
                              
  const turnShip = function(shipImgParent, replacingShipImg) {
    shipImgParent.textContent = ''
    shipImgParent.append(replacingShipImg)
  } 

  const invalidPlacementText = function() {
    console.log('ei voi asettaa tähän')
  }

  const attachListeners = function() {

    function setImgAndDragStartLocation() {
      //convert verticalShipImgsObject to an array so we may iterate it
      let verticalShipValues = Object.values(verticalDraggableShips);
      let draggableShips = new Set([...horizontalDraggableShips, ...verticalShipValues])
      
      draggableShips.forEach((ship) => {
        ship.addEventListener('dragstart', (e) => {
          setDraggedElement(e);
          setImageAndMouseDownPosition(e);
          setMouseDownDistToImgEdges();
          e.target.classList.toggle('transparent');
        });
  
        ship.addEventListener('dragend', (e) => {
          dragged.classList.toggle('transparent');
        });
      });
    };

    function setImageTracker() {

      let intercectingCells = [];
      let shipSize;

      document.addEventListener('dragover', (e) => {
        setCursorTracker(e);
        setImgLivePosition();
        shipSize = dragged.dataset.shipsize

        boardCells['shipSetterBoardCells'].forEach((cell) => {

          let cellPos = cell.getBoundingClientRect();
          if (doesImgAndCellIntercect(cellPos)) {
            
            if (!intercectingCells.includes(cell)) {
              intercectingCells.push(cell);
            }

            if (intercectingCells.length > shipSize || intercectingCells.length < shipSize ) {
              intercectingCells.forEach((cell) => {
                shipCurrentlyOutOfBounds(cell);
              });
            };

            //console.log(intercectingCells)
            
            if (intercectingCells.length == shipSize) {
              intercectingCells.forEach((cell) => shipCurrentlyInBounds(cell))

              let cellsToBePlacedUpon = document.querySelectorAll('.validPlacement');
              
              let shipFrontCoords = [
                cellsToBePlacedUpon[0].dataset.row, 
                cellsToBePlacedUpon[0].dataset.col
              ];
              let shipRearCoords = [
                cellsToBePlacedUpon[cellsToBePlacedUpon.length-1].dataset.row, 
                cellsToBePlacedUpon[cellsToBePlacedUpon.length-1].dataset.col
              ];
              if (!currentAreaAvailable(shipFrontCoords, shipRearCoords)) {
                intercectingCells.forEach((cell) => shipCurrentlyOutOfBounds(cell));
              } else intercectingCells.forEach((cell) => shipCurrentlyInBounds(cell));
            };

        } else {
            let index = intercectingCells.indexOf(cell);
            if (index !== -1) intercectingCells.splice(index, 1);
            removeValidityStyling(cell)
          };
        });
      });

      document.addEventListener('dragend', (e) => {
        let cellsToBePlacedUpon = document.querySelectorAll('.validPlacement');
        if (cellsToBePlacedUpon.length > 0) {

          /* at this point the area where the ship is about to be placed is valid, so we 
          save the former parent to a variable which we then use in controller to also update
          the internal game state */
          let formerParent = dragged.parentNode

          formerParent.removeChild(dragged);
          cellsToBePlacedUpon[0].append(dragged);

          let shipFrontCoords = [
            dragged.parentNode.dataset.row, 
            dragged.parentNode.dataset.col,
          ];
          let shipRearCoords = [
            cellsToBePlacedUpon[cellsToBePlacedUpon.length-1].dataset.row, 
            cellsToBePlacedUpon[cellsToBePlacedUpon.length-1].dataset.col
          ];
          handlePlacement(formerParent, shipFrontCoords, shipRearCoords, dragged)

        }
        boardCells['shipSetterBoardCells'].forEach((cell) => {
          removeValidityStyling(cell);
        });
        //no need to turn boat, because it will only take one cell
        if (shipSize > 1) dragged.addEventListener('click', handleTurn)
      });
    };


    function setBoardCellListeners(playerOrComp) {
      playerOrComp.forEach((cell) => {
        cell.addEventListener('click', getClickedCell)
      });
    };

    setImgAndDragStartLocation();
    setImageTracker();
    setBoardCellListeners(boardCells['mainCellsPlayer']);
    setBoardCellListeners(boardCells['mainCellsEnemy']);
  };

  const removeBoardListeners = function() {
    function setBoardCellListeners(playerOrComp) {
      playerOrComp.forEach((cell) => {
        cell.removeEventListener('click', getClickedCell)
      });
    };
    setBoardCellListeners(boardCells['mainCellsPlayer']);
    setBoardCellListeners(boardCells['mainCellsEnemy']);
  }

  const showGameResult = function(titlestring) {
    transformableTitles['gameEndStatus'].textContent = titlestring;
    transformableTitles['askNewRound'].textContent = 'New game?';
  };

  const toggleElementVisibility = function(callback) {
    callback();
  };

  const toggleWinnerAndRetryHeader = function() {
    transformableTitles['gameEndStatus'].classList.toggle('hide');
    transformableTitles['askNewRound'].classList.toggle('hide');
  }

  const toggleNewGameButtons = function() {
    otherElements['choicesParent'].classList.toggle('hide');
  };

  const toggleGameTable = function() {
    otherElements['gameTable'].classList.toggle('hide');
  };

  const getResolveClick = () => resolveClick;

  const setResolveClick = (resolve) => resolveClick = resolve;

  const emulateEnemyClick = function(row, col) {
    let cellToBeclicked = boardCells['playerBoardParent'].querySelector(`.player > [row="${row}"][col="${col}"]`);
    cellToBeclicked.click();
  }

  const invalidClickNotify = function() {
    transformableTitles['yourTurn'].textContent = 'Cell already struck! Choose another.'
    transformableTitles['yourTurn'].classList.add('invalidCellClick');
  }

  const setDefaultTitle = function() {
    transformableTitles['yourTurn'].textContent = 'Your turn!';
    transformableTitles['yourTurn'].classList.remove('invalidCellClick');
  }

  const addHideClass = function() {
    headerToBeHidden.classList.add('hide');
  }

  const removeHideClass = function() {
    headertoBeShown.classList.remove('hide');
  }

  const hideYourTurnHeader = function() {
    headerToBeHidden = transformableTitles['yourTurn'];
    headertoBeShown = transformableTitles['enemyTurn'];
  }

  const hideEnemyTurnHeader = function() {
    headerToBeHidden = transformableTitles['enemyTurn'];
    headertoBeShown = transformableTitles['yourTurn'];
  }

  const hideBothTurnTitles = function( ) {
    transformableTitles['enemyTurn'].classList.add('hide');
    transformableTitles['yourTurn'].classList.add('hide');
  }

  const getClickedCell = function() {
    /* first check if cell being clicked has already been clicked 
    or struck - if it has, stop the click handling here and put forth
    an error message for the player */
    if (this.childNodes.length > 0) {
      invalidClickNotify();
      return
    } else {
      setDefaultTitle();
    };

    let clickedBoard = this.parentNode.classList[0];

    if (clickedBoard == 'enemy') {
      if (resolveClick) {
        hideYourTurnHeader();
        resolveClick(this);
        resolveClick = null;
      }
    } else {
        hideEnemyTurnHeader();
    };

    let row = this.dataset.row;
    let col = this.dataset.col;
    handleAttack(clickedBoard, row, col);
  };

  const getPlayerShipImg = function(shipObject, shipLength) {
    let isSunk = shipObject.isSunk();

    if (shipLength == 1) return shipImages.boat;
    if (shipLength == 2 && isSunk == false) return shipImages.shipSmall;
    if (shipLength == 2 && isSunk) return shipImages.shipSmallDestroyed;
    if (shipLength == 3 && isSunk == false) return shipImages.shipMedium;
    if (shipLength == 3 && isSunk) return shipImages.shipMediumDestroyed;
    if (shipLength == 4 && isSunk == false) return shipImages.shipLarge;
    if (shipLength == 4 && isSunk) return shipImages.shipLargeDestroyed;
  }

  const getSunkenEnemyShipImg = function(shipLength) {

    if (shipLength == 1) return shipImages.boat;
    if (shipLength == 2) return shipImages.shipSmallDestroyed;
    if (shipLength == 3) return shipImages.shipMediumDestroyed;
    if (shipLength == 4) return shipImages.shipLargeDestroyed;
  }

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

  const setShipImage = function(shipImg, cell, shipLength, direction) {
    const ship = new Image();
    ship.src = shipImg;

    if (direction === 'horizontal') cell.classList.add('imageHorizontal');
    else cell.classList.add('imageVertical');

    if (shipLength === 1) {
      cell.classList.add('boat');
    } else if (shipLength === 2) {
      cell.classList.add('smallShip');
    } else if (shipLength === 3) {
      cell.classList.add('mediumShip');
    } else cell.classList.add('largeShip');

    cell.append(ship);
  }

  const getCorrectPlayerDomBoard = function(whichSubBoard) {
    return whichSubBoard == 'subCellsPlayer' ? '.player' : '.enemy'
  }

  const setShips = function(whichSubBoard, placedShips) {

    let domParent = getCorrectPlayerDomBoard(whichSubBoard)

    placedShips.forEach(shipObj => {
      let row = shipObj.coords[0][0];
      let col = shipObj.coords[0][1];
      let cell = document.querySelector(`${domParent} .sub [row="${row}"][col="${col}"]`)
      //empty the dom cell from the previous ship image before inserting a new one
      cell.textContent = '';

      let shipLength = shipObj.placedShip.getLength();
      let direction = shipObj.direction == 1 ? 'horizontal' : 'vertical';

      let shipImage;
      if (domParent === '.player') {
        shipImage = getPlayerShipImg(shipObj.placedShip, shipLength);
      } else shipImage = getSunkenEnemyShipImg(shipLength);

      setShipImage(shipImage, cell, shipLength, direction);
    });
  };

  const setMissImage = function(cell) {
    const missImage = new Image();
    missImage.src = watersplash;
    missImage.id = 'watersplashImg'
    cell.append(missImage);
  }

  const setHitImage = function(cell) {
    const hitImage = new Image();
    hitImage.src = explosion;
    hitImage.id = 'explosionImg'
    cell.append(hitImage);
  }

  const refreshBoard = function(domBoard, boardArray) {
    boardCells[domBoard].forEach((cell) => {
      cell.textContent = '';
      let rowInt = cell.dataset.row;
      let colInt = cell.dataset.col; 
      if (boardArray[rowInt][colInt] == 's' || boardArray[rowInt][colInt] == 'o') {
        setMissImage(cell)
      }
      else if (Array.isArray(boardArray[rowInt][colInt]) && boardArray[rowInt][colInt][1] == 'o') {
        setMissImage(cell);
      } else if (boardArray[rowInt][colInt] == 'x' || (Array.isArray(boardArray[rowInt][colInt]) && boardArray[rowInt][colInt][1] == 'x')) {
        setHitImage(cell)
      }
    }); 
  };

  return {
    initiateDOM,
    gethorizontalDraggableShips,
    getVerticalDraggableShips,
    makePlayerBoardClickable,
    makePlayerBoardUnClickable,
    makeEnemyBoardClickable,
    makeEnemyBoardUnClickable,
    addHideClass,
    removeHideClass,
    hideYourTurnHeader,
    hideEnemyTurnHeader,
    hideBothTurnTitles,
    turnShip,
    invalidPlacementText,
    attachListeners, 
    removeBoardListeners,
    showGameResult,
    toggleElementVisibility,
    toggleWinnerAndRetryHeader,
    toggleNewGameButtons,
    toggleGameTable,
    getResolveClick, 
    setResolveClick,
    emulateEnemyClick, 
    getClickedCell, 
    setShips, 
    refreshBoard
  };
};

export {displayHandler}