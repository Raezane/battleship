import {boardHandler} from "../src/models/boardHandler";
import {ship} from "../src/models/shipHandler";

let testGameBoard;

beforeEach(() => {
  testGameBoard = boardHandler();
  testGameBoard.buildBoard()
});

test('gameboard is set up correctly', () => {
  expect(testGameBoard.getGameBoard()).toEqual([
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null]
  ]);
});

describe('ship placement and hit registration', () => {

  let testShip;
  beforeEach(() => {
    testShip = ship(4)
  });

  test('gameboard should place ships correctly with given coordinates vertically', () => {
    testGameBoard.shipSetter(testShip, [4,7], [7,7])

    expect(testGameBoard.getGameBoard()).toEqual([
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, 'u', 'u', 'u', null],
      [null, null, null, null, null, null, 'u', testShip, 'u', null],
      [null, null, null, null, null, null, 'u', testShip, 'u', null],
      [null, null, null, null, null, null, 'u', testShip, 'u', null],
      [null, null, null, null, null, null, 'u', testShip, 'u', null],
      [null, null, null, null, null, null, 'u', 'u', 'u', null],
      [null, null, null, null, null, null, null, null, null, null],
    ]);
  });

  test('gameboard should place ships correctly with given coordinates horizontally', () => {
    testGameBoard.shipSetter(testShip, [3,2], [3,4])
    
    expect(testGameBoard.getGameBoard()).toEqual([
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, 'u', 'u', 'u', 'u', 'u', null, null, null, null],
      [null, 'u', testShip, testShip, testShip, 'u', null, null, null, null],
      [null, 'u', 'u', 'u', 'u', 'u', null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
    ]);
  });

  test('gameboard should register missed attack', () => {
    testGameBoard.shipSetter(testShip, [6,2], [8,2])
    testGameBoard.receiveAttack(2,5)
    
    expect(testGameBoard.getGameBoard()).toEqual([
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, 'o', null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, testShip, null, null, null, null, null, null, null],
      [null, null, testShip, null, null, null, null, null, null, null],
      [null, null, testShip, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
    ]);
  })

  test('gameboard should register hits to ship properly', () => {
    testGameBoard.shipSetter(testShip, [6,2], [6,5]);
    testGameBoard.receiveAttack(6,3);
    
    expect(testGameBoard.getGameBoard()).toEqual([
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, testShip, [testShip, 'x'], testShip, testShip, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
    ]);

    expect(testShip.getHits() == 1)
  })
  test("ships can't be placed on top of each other", () => {
    let testShip2 = ship(3);

    testGameBoard.shipSetter(testShip, [2,3], [2,6]);
    testGameBoard.shipSetter(testShip2, [1,4], [3,4])

    expect(testGameBoard.getGameBoard()).toEqual([
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, testShip, testShip, testShip, testShip, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
    ]);
  });

  test("there must be empty, non-placeable area surrounding every ship", () => {
    let testShip2 = ship(3);
    let testShip3 = ship(3);
    let testShip4 = ship(3);

    testGameBoard.shipSetter(testShip, [2,3], [2,6]);
    testGameBoard.shipSetter(testShip2, [2,1], [4,1]);

    //can't be placed because testShip is already placed above it
    testGameBoard.shipSetter(testShip3, [3,4], [3,6]);

    //can't be placed because testShip2 is already placed next to it northeast
    testGameBoard.shipSetter(testShip4, [5,0], [5,0]);


    expect(testGameBoard.getGameBoard()).toEqual([
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, testShip2, null, testShip, testShip, testShip, testShip, null, null, null],
      [null, testShip2, null, null, null, null, null, null, null, null],
      [null, testShip2, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
    ]);
  });
});