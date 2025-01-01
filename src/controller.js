import { boardHandler } from "./models/boardHandler.js";
import { playerHandler } from "./models/playerHandler.js";
import { displayHandler } from "./ui/displayHandler.js";

const gameController = function() {

  const display = displayHandler();
  const player = playerHandler();
  const computer = playerHandler();

  function activateDOMelements() {
    display.initiateDOM();
    display.attachListeners();
  }

  activateDOMelements();

  player.initiateBoard();
  player.playerBoard.createShips();
  player.playerBoard.setCreatedShips();

  computer.initiateBoard();
  computer.playerBoard.createShips();
  computer.playerBoard.setCreatedShips();

  display.boardRefresher(player.playerBoard.getGameBoard(), 'player');

  //function getDirectionAndLength() {}
}


export {gameController}