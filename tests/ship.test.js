import {ship} from '../src/models/shipHandler';

let testShip;

beforeEach(() => {
  testShip = ship(3);
});

describe('ship length tests', () => {
  test('creates a ship of length 3', () => {
    expect(testShip.getLength()).toBe(3);
  });

  test("ship's length is 4 at maximum", () => {
    expect(testShip.getLength()).toBeLessThanOrEqual(4)
  });

  test("ship's length is 1 at minimum", () => {
    expect(testShip.getLength()).toBeGreaterThanOrEqual(0)
  });
});

describe('hit and sinking tests', () => {
  test('hit is registered', () => {
    testShip.hit();
    expect(testShip.getHits()).toBe(1);
  });

  test('ship is sunk if hits are equal or more than ship length', () => {

    testShip.hit();
    testShip.hit();
    testShip.hit();

    expect(testShip.isSunk()).toBe(true)
  });
});