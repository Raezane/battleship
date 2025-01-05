import {boardHandler} from "../src/models/boardHandler";
import {ship} from "../src/models/shipHandler";

let testGameBoard;

testGameBoard = boardHandler();
testGameBoard.buildBoard()


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
    testGameBoard = boardHandler();
    testGameBoard.buildBoard()
    testShip = ship(4)
  });

  test('gameboard should place ships correctly with given coordinates vertically and horizontally', () => {
    testGameBoard.shipSetter(testShip, [4,7], [7,7])
    
    let testShip2 = ship(3);
    testGameBoard.shipSetter(testShip2, [1,1], [1,3])

    expect(testGameBoard.getGameBoard()).toEqual([
      ['u', 'u', 'u', 'u', 'u', null, null, null, null, null],
      ['u', testShip2, testShip2, testShip2, 'u', null, null, null, null, null],
      ['u', 'u', 'u', 'u', 'u', null, null, null, null, null],
      [null, null, null, null, null, null, 'u', 'u', 'u', null],
      [null, null, null, null, null, null, 'u', testShip, 'u', null],
      [null, null, null, null, null, null, 'u', testShip, 'u', null],
      [null, null, null, null, null, null, 'u', testShip, 'u', null],
      [null, null, null, null, null, null, 'u', testShip, 'u', null],
      [null, null, null, null, null, null, 'u', 'u', 'u', null],
      [null, null, null, null, null, null, null, null, null, null],
    ]);
  });

  test('gameboard should register missed attack properly', () => {
    testGameBoard.shipSetter(testShip, [6,2], [8,2])
    testGameBoard.receiveAttack(2,5)
    testGameBoard.receiveAttack(8,3)
    
    expect(testGameBoard.getGameBoard()).toEqual([
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, 'o', null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, 'u', 'u', 'u', null, null, null, null, null, null],
      [null, 'u', testShip, 'u', null, null, null, null, null, null],
      [null, 'u', testShip, 'u', null, null, null, null, null, null],
      [null, 'u', testShip, ['u', 'o'], null, null, null, null, null, null],
      [null, 'u', 'u', 'u', null, null, null, null, null, null],
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
      [null, 'u', 's', 'u', 's', 'u', 'u', null, null, null],
      [null, 'u', testShip, [testShip, 'x'], testShip, testShip, 'u', null, null, null],
      [null, 'u', 's', 'u', 's', 'u', 'u', null, null, null],
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
      [null, null, 'u', 'u', 'u', 'u', 'u', 'u', null, null],
      [null, null, 'u', testShip, testShip, testShip, testShip, 'u', null, null],
      [null, null, 'u', 'u', 'u', 'u', 'u', 'u', null, null],
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
      ['u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', null, null],
      ['u', testShip2, 'u', testShip, testShip, testShip, testShip, 'u', null, null],
      ['u', testShip2, 'u', 'u', 'u', 'u', 'u', 'u', null, null],
      ['u', testShip2, 'u', null, null, null, null, null, null, null],
      ['u', 'u', 'u', null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
    ]);
  });

  test("ship can be placed to edges correctly", () => {
    let testShip = ship(3);
    let testShip2 = ship(2);

    testGameBoard.shipSetter(testShip, [2,9], [4,9]);
    testGameBoard.shipSetter(testShip2, [8,0], [9,0]);

    expect(testGameBoard.getGameBoard()).toEqual([
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, 'u', 'u'],
      [null, null, null, null, null, null, null, null, 'u', testShip],
      [null, null, null, null, null, null, null, null, 'u', testShip],
      [null, null, null, null, null, null, null, null, 'u', testShip],
      [null, null, null, null, null, null, null, null, 'u', 'u'],
      [null, null, null, null, null, null, null, null, null, null],
      ['u', 'u', null, null, null, null, null, null, null, null],
      [testShip2, 'u', null, null, null, null, null, null, null, null],
      [testShip2, 'u', null, null, null, null, null, null, null, null]
    ]);
  });

  test("Gameboard should report if all the ships have been sunken", () => {

    let board = testGameBoard.getGameBoard()
    let testShip0 = ship(4);
    let testShip1 = ship(3);
    let testShip2 = ship(3);
    let testShip3 = ship(2);
    let testShip4 = ship(2);
    let testShip5 = ship(2);
    let testShip6 = ship(1);
    let testShip7 = ship(1);
    let testShip8 = ship(1);
    let testShip9 = ship(1);

    testGameBoard.shipSetter(testShip0, [1,0], [1,3]);
    testGameBoard.shipSetter(testShip1, [3,1], [5,1]);
    testGameBoard.shipSetter(testShip2, [7,1], [9,1]);
    testGameBoard.shipSetter(testShip3, [8,3], [8,4]);
    testGameBoard.shipSetter(testShip4, [5,3], [6,3]);
    testGameBoard.shipSetter(testShip5, [5,7], [5,8]);
    testGameBoard.shipSetter(testShip6, [3,4], [3,4]);
    testGameBoard.shipSetter(testShip7, [8,8], [8,8]);
    testGameBoard.shipSetter(testShip8, [2,9], [2,9]);
    testGameBoard.shipSetter(testShip9, [0,7], [0,7]); 

    for (let row = 0; row < 10; row++) {
      for (let column = 0; column < 10; column++) {
        if (board[row][column] !== null && typeof board[row][column] === 'object') {
          testGameBoard.receiveAttack(row,column)
        }
      }
    }

    expect(testGameBoard.getGameBoard()).toEqual([
      ['s', 's', 's', 's', 's', null, 's', [testShip9, 'x'], 's', null],
      [[testShip0, 'x'], [testShip0, 'x'], [testShip0, 'x'], [testShip0, 'x'], 's', null, 's', 's', 's', 's'],
      ['s', 's', 's', 's', 's', 's', null, null, 's', [testShip8, 'x']],
      ['s', [testShip1, 'x'], 's', 's', [testShip6, 'x'], 's', null, null, 's', 's'],
      ['s', [testShip1, 'x'], 's', 's', 's', 's', 's', 's', 's', 's'],
      ['s', [testShip1, 'x'], 's', [testShip4, 'x'], 's', null, 's', [testShip5, 'x'], [testShip5, 'x'], 's'],
      ['s', 's', 's', [testShip4, 'x'], 's', null, 's', 's', 's', 's'],
      ['s', [testShip2, 'x'], 's', 's', 's', 's', null, 's', 's', 's'],
      ['s', [testShip2, 'x'], 's', [testShip3, 'x'], [testShip3, 'x'], 's', null, 's', [testShip7, 'x'], 's'],
      ['s', [testShip2, 'x'], 's', 's', 's', 's', null, 's', 's', 's']
    ]);
    
    expect(testGameBoard.areAllSunk()).toBe(true)
  }); 
});