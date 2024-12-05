import {gameBoard} from "../src/models/gameboard";
import {ship} from "../src/models/ship";

let testGameBoard;

beforeEach(() => {
  testGameBoard = gameBoard();
  testGameBoard.buildBoard()
});

test('gameboard is set up correctly', () => {
  expect(testGameBoard.getGameBoard()).toEqual([
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  ]);
});


test('gameboard should place ships correctly with given coordinates vertically', () => {
  let testShip = ship(4)
  testGameBoard.placeShip(testShip, [4,7], [7,7])
  
  expect(testGameBoard.getGameBoard()).toEqual([
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, testShip, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, testShip, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, testShip, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, testShip, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  ]);
})

test('gameboard should place ships correctly with given coordinates horizontally', () => {
  let testShip = ship(4)
  testGameBoard.placeShip(testShip, [3,2], [3,4])
  
  expect(testGameBoard.getGameBoard()).toEqual([
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, testShip, testShip, testShip, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  ]);
})

test('gameboard should register missed attack', () => {
  let testShip = ship(4)
  testGameBoard.placeShip(testShip, [6,2], [8,2])
  testGameBoard.receiveAttack(2,5)
  
  expect(testGameBoard.getGameBoard()).toEqual([
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 'o', 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, testShip, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, testShip, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, testShip, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  ]);
})

test('gameboard should register hits to ship properly', () => {
  let testShip = ship(3)
  testGameBoard.placeShip(testShip, [6,2], [6,4])
  testGameBoard.receiveAttack(6,3)
  
  expect(testGameBoard.getGameBoard()).toEqual([
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, testShip, [testShip, 'o'], testShip, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  ]);

  expect(testShip.getHits() == 1)
})