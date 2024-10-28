# Problem Set 4

In this lab, you will create a version of [MineSweeper](https://minesweeperonline.com) that connects to a game server.  In this version:

* the entirety of the Minesweeper logic is on a server
* the user can select a space with a left-click or unmark/mark a flag with by holding left-click

## Your Goal

Alter the client-side MineSweeper class to correctly connect to the server and update. You **will** need to alter other code, but you should be very careful about doing so. 

**TEST OFTEN!**

## What You Submit
Only submit the __minesweeper.html__ file. 

If you complete any additional tiers, submit a .zip file of the entire folder (**WITHOUT the __node_modules__ folder**)

## Setup
1. Download an unzip the server project provided
2. Install dependancies with `npm install`
3. Complete `minesweeper.html` so that a user can create and play a game of MineSweeper.  Other users must be able to observe/play a currently running game (using SSE updates!)

## Implementation Details
* Currently, all people can play and observe every game
* Client **(you do this!)**
  * Allow the user to pick a space or place a flag
  * Update the score and time correctly
  * Update the board when an SSE event happens
* Server **(this exists already!)**
  * GET /minesweeper - the introduction page to the game
  * GET /minesweeper/game - creates or observes a game with the following URL-encoded parameters
    * gameid (optional) - the id of the game to observe; if this is undefined then a new game is created
    * name (optional; defaults to Anonymous) - the name of the player
    * rows (optional; defaults to 10) - number of rows in the game; only used when creating a new game
    * cols (optional; defaults to 10) - number columns in the game; only used when creating a new game
    * difficulty (optional; defaults to med) - the difficulty of the game (easy/med/hard); only used when creating a new game
  * POST /minesweeeper/move - make a move with JSON-encoded data
    * gameid - the id of the game
    * row - the row of the move
    * col - the column of the move
    * flag - true to toggle a flag; false otherwise
  * GET /minesweeper/info - provide information about the current game using URL-encoded data
    * gameid - the id of the game to query
    * action - the action to perform
      * board - the public state of the board as a dictionary (row,col) = value where value is one of [0,8], 'M' for a mine, 'F' for a flag, or -1 if covered.  gameOver indicates win (positive), loss (negative), or neither (0)
      * probe - check one space at (__row__,__col__)      
      * score - the current score
      * size - the size of the board in the form of [__#rows__,__#cols__]
      * time - the current elapsed time
  * GET /minesweeper/events - set up a SSE stream for push updates.  Each update is a JSON-encoded string of gameid and action (currently only 'update')

## Rubric (Base Tier)
* Class/IDs are well named and make sense.
* Internal CSS - includes theming information and styles common to the landing and contact pages.
    * Use of CSS variables to control grid layout.
    * Proper use of the Grid Layout.
    * Theming and colors are **not** atrocious.
* Internal JavaScript
    * Proper separation of functions, responsibilities, and logic.  The MineSweeper logic must be removed from the client code.
    * Correct use of event handlers.
    * Correct use of fetch to make a move and update the board
    * Correct use of EventSource to connect and respond to the update stream
    * Grid is dynamically allocated during start.
    * Win/Lose is properly indicated.

## Additional Tiers
* Edit the MineSweeper logic to implement the difficulty
  * easy: each space has 10% of being a mine
  * med: 20% chance
  * hard: 30% chance
* Implement correctly handling the Player's name:
  * Edit __server.js__ to handle the name on creation
  * Edit __server.js__ to add the "name" action to the __probe__ route
  * Edit __minesweeper.html__ to properly display the name
* Edit the server so that there are two "modes":
  * Player - the user creates and plays the game; the player can make moves
  * Observer - all other people; these users observe other players' boards