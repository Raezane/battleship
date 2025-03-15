**BATTLESHIP**

**Overview**
- this app is a turn-based battleship game. You can place your ships to the gameboard how you like (but according to rules) and then start playing against the computer. The player who has first sunk all the opponent's ships, wins the game.

**Features**
- the ships can be placed to gameboard by dragging them to it or setting them automatically
- the gameboard gives a graphical feedback to user dragging the current ship, if that current area is a valid dropping area or not
- the ships can be placed either horizontally or vertically
- there must always be at least one empty row and/or column between ships when placing them
- the game can only be played against computer at the moment
- the computer has an intelligence that knows to strike adjacent cells if it has hit a player ship on its previous turn

**Technologies Used**
- Languages: JavaScript, HTML, CSS
- Tools & Libraries: Webpack, Jest, Prettier, Eslint, Babel, NPM, Lodash

**Challenges & Learnings**
- The main purpose of this project was to practice on Test-Driven Development. In the end, the TDD implementation and usage was not at all one of the hardest parts of the project. Instead, the greatest single challenge must have been implementing the gameboard's graphical feedback depending on where the ship being dragged is currently on the screen. It required calculating the position where the mouse is clicked when the dragging started, the image's original and live positions on the screen, tracking the mouse cursor position live when dragging and then by using all this data give the visual feedback to individual cells, if the ship live position intersects with a cell and current placement is valid or not.
- I also learned a lot more of how absolute positioning works, when placing the ships
- The usage of Promises in making the game play by turns, made me realise exactly how convenient the promises are in practice

**Future Improvements**
- the next logical upgrade would be to implement a human player versus human player gaming possibility