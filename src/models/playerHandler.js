import { getRandomNumber } from "../utilities";
import { boardHandler } from "./boardHandler";

const playerHandler = function() {

  const playerBoard = boardHandler();
  const initiateBoard = () => playerBoard.buildBoard();

  return { playerBoard, initiateBoard};
};

export {playerHandler}