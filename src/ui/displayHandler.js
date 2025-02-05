import { handleAttack } from "../controller.js";

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


  let draggableShips = {
    'bigShip': null,
    'mediumShip1': null,
    'mediumShip2': null,
    'smallShip1': null,
    'smallShip2': null,
    'smallShip3': null,
    'boat1': null,
    'boat2': null,
    'boat3': null,
    'boat4': null,

  }

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

  const initiateDraggableShips = function() {
    draggableShips['bigShip'] = document.querySelector('.bigshiphorizontal');
    draggableShips['mediumShip1'] = document.querySelector('.medium1');
    draggableShips['mediumShip2'] = document.querySelector('.medium2');
    draggableShips['smallShip1'] = document.querySelector('.small1');
    draggableShips['smallShip2'] = document.querySelector('.small2');
    draggableShips['smallShip3'] = document.querySelector('.small3');
    draggableShips['boat1'] = document.querySelector('.boat1');
    draggableShips['boat2'] = document.querySelector('.boat2');
    draggableShips['boat3'] = document.querySelector('.boat3');
    draggableShips['boat4'] = document.querySelector('.boat4');
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
    initiateDraggableShips();
    initiateBoardcells();
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

  const attachListeners = function() {

    let cellArray = [];

    function setImgAndDragStartLocation() {
      for (const key in draggableShips) {
        draggableShips[key].addEventListener('dragstart', (e) => {
          setDraggedElement(e);
          setImageAndMouseDownPosition(e);
          setMouseDownDistToImgEdges();
          e.target.classList.toggle('transparent');
        });
  
        draggableShips[key].addEventListener('dragend', (e) => {
          dragged.classList.toggle('transparent');
        });
      };
    };

    function setImageTracker() {
      document.addEventListener('dragover', (e) => {
        setCursorTracker(e);
        setImgLivePosition();
        let shipSize = dragged.dataset.shipsize

        boardCells['shipSetterBoardCells'].forEach((cell) => {

          let cellPos = cell.getBoundingClientRect();
          if (doesImgAndCellIntercect(cellPos)) {
            if (!cellArray.includes(cell) && cellArray.length < shipSize) {
              cellArray.push(cell);
            };
            if (cellArray.length < shipSize) {
              cellArray.forEach((cell) => cell.classList.add('invalidPlacement'))
            }
            if (cellArray.length == shipSize) {
              cellArray.forEach((cell) => cell.classList.remove('invalidPlacement'));
              cellArray.forEach((cell) => cell.classList.add('validPlacement'));
              };
            } else {
              cellArray.pop();
              cell.classList.remove('invalidPlacement');
              cell.classList.remove('validPlacement');
            }

        });
      });
    };

    function setModalBoardCellListeners(modalCells) {

    };

    function setBoardCellListeners(playerOrComp) {
      playerOrComp.forEach((cell) => {
        cell.addEventListener('click', getClickedCell)
      });
    };

    setImgAndDragStartLocation();
    setImageTracker();
    setModalBoardCellListeners(boardCells['shipSetterBoardCells']);
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

    let row = this.getAttribute('row');
    let col = this.getAttribute('col');
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
      let rowInt = cell.getAttribute('row');
      let colInt = cell.getAttribute('col'); 
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
    makePlayerBoardClickable,
    makePlayerBoardUnClickable,
    makeEnemyBoardClickable,
    makeEnemyBoardUnClickable,
    addHideClass,
    removeHideClass,
    hideYourTurnHeader,
    hideEnemyTurnHeader,
    hideBothTurnTitles,
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