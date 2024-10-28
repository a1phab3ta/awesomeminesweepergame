/**
 * 
 * The Public Interface is not allowed to change!
 * Make sure you add a JSDoc comment to every non-private method or attribute
 */
module.exports = class MineSweeper {
    /**
     * 2D list
     * 0-8: uncovered number of mines around space
     * 9: uncovered mine
     * negative: covered equivalent
     * -10: covered zero
     * < -10: flagged equivalent of negative
     */
    #board              

    #startTime          // ms
    #gameOver           // 1 = win, -1 = lose, 0 = keep going
    #numMines
    
    #score
    #name

    #PERCENT_CHANCE_MINE = 20
    
    static #COVERED_ZERO = -10
    static #FLAG_MOD = 10
    
    static #OPEN = -1
    /**
     * @return {int} value representing a selectable space
     */
    get OPEN() {
        return MineSweeper.#OPEN;
    }

    static #FLAG = -2
    /**
     * @return {int} value representing a flag placemnt
     */
    get FLAG() {
        return MineSweeper.#FLAG
    }

    static #MINE = 9
    /**
     * @return {int} value representing a mine
     */
    get MINE() {
        return MineSweeper.#MINE;
    }

    /**
     * Create a populating MineSweeper board
     * @param rows number of rows in the game
     * @param cols number of columns in the game
     */
    constructor(rows, cols){
        this.#numMines = 0;
        this.#startTime = 0;
        this.#board = []
        for( let row = 0; row < rows; row++ ){
            let r = [];
            for( let col = 0; col < cols; col++ ){
                r.push(0);
            }
            this.#board.push(r);
        }

        this.#resetBoard();
    }
    #resetBoard() {
        this.#score = this.rows*this.cols;
        this.#gameOver = 0;

        // Reset the board to zeros
        for( let row = 0; row < this.rows; row++ ){
            for( let col = 0; col < this.cols; col++ ){
                this.#board[row][col] = 0;
            }
        }

        // Place mines and calculate board spaces
        for( let row = 0; row < this.rows; row++ ){
            for( let col = 0; col < this.cols; col++ ){
                let isMine = Math.random()*100 < this.#PERCENT_CHANCE_MINE;
                if( isMine ){
                    this.#board[row][col] = -this.MINE;
                    this.#numMines++;

                    // Deduct one from adjacent spaces
                    for( let r = row-1; r <= row+1; r++ ){
                        for( let c = col-1; c <= col+1; c++ ){
                            if( r >= 0 && r < this.rows && c >= 0 && c < this.cols){
                                if( this.#board[r][c] !== -this.MINE){
                                    this.#board[r][c]--;
                                }
                            }
                        }
                    }
                }
            }
        }

        // Set zeros to their covered values
        for( let row = 0; row < this.rows; row++ ){
            for( let col = 0; col < this.cols; col++ ){
                if( this.#board[row][col] == 0){
                    this.#board[row][col] = MineSweeper.#COVERED_ZERO
                }
            }
        }
    }

    /**
     * Picks a space and enforces rules of MineSweeper
     * 
     * @param {int} row row to select (start at zero)
     * @param {int} col column to select (start at zero)
     * @param {bool} toogleFlag true to toggle a flag placement
     * @return {boolean} true if the move was valid, false otherwise
     */
    pickSpace(row, col, toggleFlag = false){
        
        if( this.#gameOver ){
            return false;
        }
        
        if(row < 0 || row >= this.rows || col < 0 || col >= this.cols){
            return false;
        }

        // Already picked
        if( this.#board[row][col] >= 0 ){
            return false;
        }

        // Toggle the Flag
        if( toggleFlag ){
            let mod = -MineSweeper.#FLAG_MOD;
            if( this.#board[row][col] < mod ){
                mod *= -1
            }

            this.#board[row][col] += mod;                        
            return true;
        }

        // Flagged spaces cannot be picked
        if( this.#board[row][col] < -MineSweeper.#FLAG_MOD){
            return false;
        }


        this.#uncoverSpace(row, col)
        this.#score--;
        if( this.#board[row][col] == 0){
            // Hit a zero, uncover the spaces around this one
            for( let r = row-1; r <= row+1; r++ ){
                for( let c = col-1; c<=col+1; c++){
                    this.pickSpace(r,c);
                }
            }
        }
        else if( this.#board[row][col] == this.MINE ){
            // Losing Free the score and time taken
            this.#gameOver = -1;
            this.#startTime = -1*this.time
        }
        
        // Winning!
        if( this.#score == this.#numMines ){
            this.#gameOver = 1;
            this.#startTime = -1*this.time
        }
    }

    #uncoverSpace(row, col){
        if( this.#board[row][col] >= 0 ){
            return this.#board[row][col];
        }

        // Remove the flag
        if(this.#board[row][col] < -MineSweeper.#FLAG_MOD){
            this.#board[row][col] += MineSweeper.#FLAG_MOD;
        }

        // Uncover the space
        if(this.#board[row][col] < 0 ){
            this.#board[row][col] *= -1;
        }

        // Set the zero properly
        if(this.#board[row][col] == -MineSweeper.#COVERED_ZERO){
            this.#board[row][col] = 0;
        }
        return this.#board[row][col];
    }

    /**
     * Get the status of a space
     * @param {int} row the row to query (starting at zero)
     * @param {int} col the column to query (starting at zero)
     * @return {int} value at (row,col) if uncovered, OPEN if covered or invalid
     */
    getSpace(row, col){
        if( row < 0 || row >= this.rows || col < 0 || col >= this.cols){
            return this.OPEN;
        }

        // Game's Over... uncover the space!
        if(this.gameOver){
            this.#uncoverSpace(row, col);
            return this.#board[row][col]
        }

        if( this.#board[row][col] < -MineSweeper.#FLAG_MOD ){
            return this.FLAG;
        }

        if( this.#board[row][col] < 0 ){
            return this.OPEN;
        }

        return this.#board[row][col];
    }

    /**
     * Begins the game
     */ 
    startGame() {
        this.#startTime = new Date().getTime();
    }

    /**
     * @return number of columns in the game
     */
    get cols(){
        return this.#board[0].length
    }

    /**
     * @return {int} number of rows in the game
     */
    get rows() {
        return this.#board.length
    }

    /**
     * The game over status of the game
     * @return {int} negative if loss, positive if win, zero otherwise
     */
    get gameOver() {
        return this.#gameOver;
    }

    /**
     * @return {number} the calculated score of the game
     */
    get score() {
        return this.#score;
    }

    /**
     * @return {int} seconds which have passed in the game
     */
    get time() {
        if( this.#startTime <= 0 ){
            return Math.abs(this.#startTime);
        }

        return new Date().getTime() - this.#startTime
    }

    /**
     * @return {string} name of the player
     */
    get name() {

    }

    /**
     * @param {string} n new name of the player
     */
    set name( n ){

    }
}

let ms = new module.exports(5,5)

