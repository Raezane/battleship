import {
  currentAreaAvailable, 
  clearCurrentArea, 
  handlePlacement, 
  handleTurn, 
  handleAttack,
  setShipsAuto,
  startGame, 
  takeNewRound,
  redirect,
  getShipMapping
 } from "../controller.js";

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

  let horizontalDraggableShips = new Map();
  let verticalDraggableShips = new Map();
  let allDraggableShips;

  let boardCells = {}

  let transformableTitles = {}

  let otherElements = {}

  const getHorizontalDraggableShips = () => horizontalDraggableShips;
  const getVerticalDraggableShips = () => verticalDraggableShips;

  const addShipImagesToSet = function(setToAddTo, direction) {
    setToAddTo.set('big1', document.querySelector(`${direction}.big1`));
    setToAddTo.set('medium1', document.querySelector(`${direction}.medium1`));
    setToAddTo.set('medium2', document.querySelector(`${direction}.medium2`));
    setToAddTo.set('small1', document.querySelector(`${direction}.small1`));
    setToAddTo.set('small2', document.querySelector(`${direction}.small2`));
    setToAddTo.set('small3', document.querySelector(`${direction}.small3`));

    //only add boats to horizontal set, because we don't need to turn them
    if (direction === '.horizontal') {
      setToAddTo.set('boat1', document.querySelector(`.boat1`));
      setToAddTo.set('boat2', document.querySelector(`.boat2`));
      setToAddTo.set('boat3', document.querySelector(`.boat3`));
      setToAddTo.set('boat4', document.querySelector(`.boat4`));
    }
  }

  const createVerticalDraggableShips = function() {

    function verticalDraggableShipCreator(imgSource, class1, class3, shipsizeInt) {
      
      let shipImage = new Image();
      shipImage.src = imgSource;
      shipImage.classList.add(class1, 'vertical', class3);
      shipImage.setAttribute('data-shipsize', shipsizeInt);
      shipImage.classList.toggle('removeElement');

      otherElements['placeableShips'].append(shipImage);
    };

    verticalDraggableShipCreator(ship4A, 'bigship', 'big1', 4);
    verticalDraggableShipCreator(ship3A, 'mediumship', 'medium1', 3);
    verticalDraggableShipCreator(ship3A, 'mediumship', 'medium2', 3);
    verticalDraggableShipCreator(ship2A, 'smallship', 'small1', 2);
    verticalDraggableShipCreator(ship2A, 'smallship', 'small2', 2);
    verticalDraggableShipCreator(ship2A, 'smallship', 'small3', 2);

  };

  const initiateBoardcells = function() {
    boardCells['shipSetterCells'] = document.querySelectorAll('.placement div');
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
    otherElements['shipSetterModal'] = document.querySelector('dialog');
    otherElements['informText'] = document.querySelector('.play .informtext')
    otherElements['playButton'] = document.querySelector('.play > button');
    otherElements['informPlacing'] = document.querySelector('.setship .informtext')
    otherElements['setShipsButton'] = document.querySelector('.setship > button')
    otherElements['placeableShips'] = document.querySelector('.placeableships');
    otherElements['gameTable'] = document.querySelector('#gametable');
    otherElements['choicesParent'] = document.querySelector('.choices');
    otherElements['yesButton'] = document.querySelector('.choices button:first-child');
    otherElements['noButton'] = document.querySelector('.choices button:nth-child(2)');
  }

  const initiateDOM = function() {
    initiateBoardcells();
    initiateTitles();
    initiateOtherElements();
    addShipImagesToSet(horizontalDraggableShips, '.horizontal');
    createVerticalDraggableShips();
    addShipImagesToSet(verticalDraggableShips, '.vertical');
    allDraggableShips = new Set([...horizontalDraggableShips, ...verticalDraggableShips]);
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

  const setDraggedElement = function(img) {
    dragged = img;
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
                              
  const turnShip = function(shipImgParent, replacingShipImg) {
    shipImgParent.textContent = '';
    shipImgParent.append(replacingShipImg);
    replacingShipImg.classList.remove('removeElement');
  } 

  const invalidPlacementText = function(text) {
    otherElements['informText'].textContent = text;
    otherElements['informText'].classList.remove('positive');
    otherElements['informText'].classList.remove('pulsateAnimation');
    otherElements['informText'].classList.add('negative');
    setTimeout(() => {
      informAboutTurning();
    }, 2000);
    
  }

  const informAboutTurning = function() {
    otherElements['informText'].classList.remove('negative');
    otherElements['informText'].classList.add('positive');
    otherElements['informText'].classList.add('pulsateAnimation');
    otherElements['informText'].textContent = '* You can turn your ship by clicking it *';
  }

  const hidePlacingInfo = function() {
    otherElements['informPlacing'].classList.add('hide');
  }

  const colorGameResultTitle = function(colorsignal) {
    transformableTitles['gameEndStatus'].classList.add(colorsignal)
  }

  const attachListeners = function() {

    let shipSize;

    function createInteractivityForShips() {

      allDraggableShips.forEach((ship) => {
        ship[1].addEventListener('dragstart', (e) => {
          setDraggedElement(e.target);
          setImageAndMouseDownPosition(e);
          setMouseDownDistToImgEdges();
          e.target.classList.toggle('transparent');
          let formerParent = dragged.parentNode
          /* check if the former parent of the ship is a cell and not the initial 
          area where the ships are being dragged originally from */
          if (!formerParent.classList.contains('shipimgdiv')){
            clearCurrentArea(dragged);
          };
        });
  
        ship[1].addEventListener('dragend', () => {
          dragged.classList.toggle('transparent');
        });

        ship[1].addEventListener('click', handleTurn);
      });
    };

    function setImageTracker() {

      let intercectingCells = [];

      document.addEventListener('dragover', (e) => {
        setCursorTracker(e);
        setImgLivePosition();
        shipSize = dragged.dataset.shipsize

        boardCells['shipSetterCells'].forEach((cell) => {

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
              if (!currentAreaAvailable(shipFrontCoords, shipRearCoords, dragged)) {
                intercectingCells.forEach((cell) => shipCurrentlyOutOfBounds(cell));
              } else intercectingCells.forEach((cell) => shipCurrentlyInBounds(cell));
            };

        } else {
            let index = intercectingCells.indexOf(cell);
            if (index !== -1) intercectingCells.splice(index, 1);
            removeValidityStyling(cell);
          };
        });
      });

      document.addEventListener('dragend', () => {

        let cellsToBePlacedUpon = document.querySelectorAll('.validPlacement');

        if (cellsToBePlacedUpon.length > 0) {

          cellsToBePlacedUpon[0].append(dragged);

          let shipFrontCoords = [
            dragged.parentNode.dataset.row, 
            dragged.parentNode.dataset.col,
          ];

          let shipRearCoords = [
            cellsToBePlacedUpon[cellsToBePlacedUpon.length-1].dataset.row, 
            cellsToBePlacedUpon[cellsToBePlacedUpon.length-1].dataset.col
          ];
          handlePlacement(shipFrontCoords, shipRearCoords, dragged);
          informAboutTurning();

        } else {
            console.log(dragged, dragged.parentNode)
            let shipRearRow;
            let shipRearCol;
            if (dragged.classList.contains('horizontal')) {
              shipRearRow = dragged.parentNode.dataset.row;
              shipRearCol = parseInt(dragged.parentNode.dataset.col) + (shipSize-1);
            } else {
              shipRearRow = parseInt(dragged.parentNode.dataset.row) + (shipSize-1);
              shipRearCol = dragged.parentNode.dataset.col;
            }
            let shipFrontCoords = [
              dragged.parentNode.dataset.row, 
              dragged.parentNode.dataset.col,
            ];
            let shipRearCoords = [shipRearRow, shipRearCol];
            handlePlacement(shipFrontCoords, shipRearCoords, dragged);
            invalidPlacementText("Placing area invalid!");
          
        }

        boardCells['shipSetterCells'].forEach((cell) => {
          removeValidityStyling(cell);
        });
      });
    };

    function setDialogButtonListeners() {
      otherElements['playButton'].addEventListener('click', startGame);
      otherElements['setShipsButton'].addEventListener('click', setShipsAuto);
    };

    function setRetryGameButtons() {
      otherElements['yesButton'].addEventListener('click', takeNewRound);
      otherElements['noButton'].addEventListener('click', redirect);
    }

    function setBoardCellListeners(playerOrComp) {
      playerOrComp.forEach((cell) => {
        cell.addEventListener('click', getClickedCell)
      });
    };

    createInteractivityForShips();
    setImageTracker();
    setDialogButtonListeners();
    setRetryGameButtons();
    setBoardCellListeners(boardCells['mainCellsPlayer']);
    setBoardCellListeners(boardCells['mainCellsEnemy']);
  };

  const hideModal = function() {
    otherElements['shipSetterModal'].classList.add('removeElement')
  }

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

  const toggleWinnerAndRetryHeader = function() {
    transformableTitles['gameEndStatus'].classList.toggle('hide');
    transformableTitles['askNewRound'].classList.toggle('hide');
  };

  const togglePlayButton = function(hideOrShow) {
    if (hideOrShow == 'hide') {
      otherElements['playButton'].classList.add('hide')
    } else {
      otherElements['playButton'].classList.remove('hide')
      otherElements['playButton'].classList.add('pulsateAnimation')
    };
  };

  const toggleNewGameButtons = function() {
    otherElements['choicesParent'].classList.toggle('hide');
  };

  const toggleGameTable = function() {
    otherElements['gameTable'].classList.toggle('hide');
  };

  const getResolveClick = () => resolveClick;

  const setResolveClick = (resolve) => resolveClick = resolve;

  const emulateEnemyClick = function(row, col) {
    let cellToBeclicked = boardCells['playerBoardParent'].querySelector(`.player > [data-row="${row}"][data-col="${col}"]`);
    cellToBeclicked.click();
  }

  const invalidClickNotify = function() {
    transformableTitles['yourTurn'].textContent = 'Cell already struck! Choose another.'
    transformableTitles['yourTurn'].classList.add('informtext', 'negative');
  }

  const setDefaultTitle = function() {
    transformableTitles['yourTurn'].textContent = 'Your turn!';
    transformableTitles['yourTurn'].classList.remove('informtext', 'negative');
  }

  const addHideClassToTurnHeader = function() {
    headerToBeHidden.classList.add('hide');
  }

  const removeHideClassFromTurnHeader = function() {
    headertoBeShown.classList.remove('hide');
  }

  const setYourTurnHeaderToBeHidden = function() {
    headerToBeHidden = transformableTitles['yourTurn'];
    headertoBeShown = transformableTitles['enemyTurn'];
  }

  const setEnemyTurnHeaderToBeHidden = function() {
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
        setYourTurnHeaderToBeHidden();
        resolveClick(this);
        resolveClick = null;
      }
    } else {
        setEnemyTurnHeaderToBeHidden();
    };

    let row = this.dataset.row;
    let col = this.dataset.col;
    handleAttack(clickedBoard, row, col);
  };

  const relocateModalShipImgs = function(placedShipObj, cell, shipLength, direction) {
    
    let shipMapping = getShipMapping()
    
    function findCorrectShipImg() {
      for (let [domShipImg, shipObj] of shipMapping) {
        if (placedShipObj === shipObj) {
          if (domShipImg.classList[1] == direction || domShipImg.classList[0] == 'modalboat') {
            return domShipImg
          } else domShipImg.classList.add('removeElement')
        }
      }
    }

    let shipImgToRelocate = findCorrectShipImg();
    shipImgToRelocate.classList.remove('removeElement')
    cell.append(shipImgToRelocate)
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
    if (whichSubBoard == 'shipSetterCells') return '.placement';
    if (whichSubBoard == 'subCellsPlayer') return '.player .sub';
    if (whichSubBoard == 'subCellsEnemy') return '.enemy .sub';
  }

  const removeShipImgs = function(placedShips) {
    placedShips.forEach(shipObj => {
      let cell = getCell(shipObj)
      cell.textContent = ''
    });
  };

  const getCell = function(shipObj) {
    let row = shipObj.coords[0][0];
    let col = shipObj.coords[0][1];
    return document.querySelector(`.placement [data-row="${row}"][data-col="${col}"]`);
  }

  const setShips = function(whichSubBoard, placedShips) {

    let domParent = getCorrectPlayerDomBoard(whichSubBoard)
    placedShips.forEach(shipObj => {
      let row = shipObj.coords[0][0];
      let col = shipObj.coords[0][1];
      let cell = document.querySelector(`${domParent} [data-row="${row}"][data-col="${col}"]`)
      //empty the dom cell from the previous ship image before inserting a new one
      cell.textContent = '';

      let shipLength = shipObj.placedShip.getLength();
      let direction = shipObj.direction == 1 ? 'horizontal' : 'vertical';

      let shipImage;
      if (domParent === '.placement') {
        relocateModalShipImgs(shipObj.placedShip, cell, shipLength, direction);
      } else if (domParent === '.player .sub') {
          shipImage = getPlayerShipImg(shipObj.placedShip, shipLength);
          setShipImage(shipImage, cell, shipLength, direction);
      } else {
          shipImage = getSunkenEnemyShipImg(shipLength);
          setShipImage(shipImage, cell, shipLength, direction);
      }
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
    hideModal,
    getHorizontalDraggableShips,
    getVerticalDraggableShips,
    makePlayerBoardClickable,
    makePlayerBoardUnClickable,
    makeEnemyBoardClickable,
    makeEnemyBoardUnClickable,
    addHideClassToTurnHeader,
    removeHideClassFromTurnHeader,
    setYourTurnHeaderToBeHidden,
    setEnemyTurnHeaderToBeHidden,
    hideBothTurnTitles,
    turnShip,
    invalidPlacementText,
    hidePlacingInfo,
    colorGameResultTitle,
    informAboutTurning,
    attachListeners, 
    removeBoardListeners,
    showGameResult,
    toggleWinnerAndRetryHeader,
    togglePlayButton,
    toggleNewGameButtons,
    toggleGameTable,
    getResolveClick, 
    setResolveClick,
    emulateEnemyClick, 
    getClickedCell, 
    removeShipImgs,
    setShips, 
    refreshBoard
  };
};

export {displayHandler}