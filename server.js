const express = require("express")
const parser = require("body-parser")
const path = require("path")
const {v4: uuidv4} = require('uuid')

const game_logic = require(path.join(__dirname, 'minesweeper', 'minesweeper_logic.js'))

const games = {}
const clients = {}

const PORT = 4242
const app = express();
app.use("/static", express.static(path.join(__dirname, "public")) )
app.use(parser.json())


app.get("/minesweeper", function(req, res){
    res.sendFile(path.join(__dirname, "minesweeper", "intro.html"))
});
app.get("/minesweeper/game", function(req,res){
    let rows = parseInt(req.query.rows) || 10;
    let cols = parseInt(req.query.cols) || 10;
    let difficulty = req.query.difficulty || 'med';
    let name = req.query.name || 'Anonymous';
    let uid = req.query.gameid



    let redirect = false;
    if( isNaN(rows) || rows < 3 || rows > 10 ){
        rows = 10;
    }
    if( isNaN(cols) || cols < 3 || cols > 10 ){
        cols = 10;
    }
    if( difficulty != 'easy' && difficulty != 'med' && difficulty != 'hard'){
        difficulty = 'med';
    }

    if( !uid ) {
        uid = uuidv4();
        games[uid] = new game_logic(rows, cols);
        games[uid].startGame()
        console.log(`Game Created: ${uid}, ${rows}x${cols} ${difficulty} ${name}`)
 
        redirect = true;
    }
    else if( !(uid in games)){
        res.send("Game Does Not Exist.")
        return;
    }

    if( redirect ){
        res.redirect (`/minesweeper/game?gameid=${uid}`)
        return;
    }

    res.sendFile(path.join(__dirname,"minesweeper", "minesweeper.html"));
})

app.post('/minesweeper/move', function(req,res){
    const packet = {
        status: 'error',
        message: 'Invalid Game ID' 
    }
    let gameid = req.body.gameid;
    if( !(gameid in games) ){
        res.send(JSON.stringify(packet))
        return;
    }
    
    let game = games[gameid];
    let row = req.body.row
    let col = req.body.col
    let triggerFlag = req.body.flag
    if( row < 0 || row > game.rows ){
        packet.message = "Invalid row"
    }
    else if( col < 0 || row > game.cols ){
        packet.message = "Invalid column"
    }
    else {
        let flag = false;
        if( triggerFlag ){
            flag = true;
        }

        game.pickSpace(row, col, flag)
        packet.status = 'success'
        packet.message = {
            'gameOver' : game.gameOver
        }
        sendEvent(gameid)
    }
    res.send(JSON.stringify(packet))
})

function sendEvent(gameid){
    let packet = JSON.stringify({
        gameid,
        action: 'update'
    })
    for( let client in clients ){
        clients[client].response.write(`data: ${packet}\n\n`)
    }
}
app.get("/minesweeper/events", function(req,res){
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); 

    let client = {
        clientID: Date.now(),
        response: res
    }
    clients[client.clientID] = client

    res.on('close', () => {
        delete clients[client.clientID];
        res.end();
    })
})

app.get('/minesweeper/info', function(req,res){
    const packet = {
        status: 'error',
        message: 'Invalid Game ID' 
    }
    const id = req.query.gameid;
    if( id in games){
        packet.status = 'success';
        packet.message = '';

        const game = games[id];
        let action = req.query.action

        // score, move, probe, time
        if( action == 'score' ){
            packet['message'] = game.score;
        }
        else if( action == 'time' ) {
            packet['message'] = game.time;
        }
        else if( action == 'size') {
            packet.message = `[${game.rows},${game.cols}]`
        }
        else if( action == 'board' ){
            packet.message = {};
            for( let r = 0; r < game.rows; r++ ){
                for(let c = 0; c < game.cols; c++ ) {
                    const space = `(${r},${c})`
                    packet.message[space] = game.getSpace(r, c);
                    if( packet.message[space] == game.MINE){
                        packet.message[space] = 'M'
                    }
                    else if( packet.message[space] == game.FLAG){
                        packet.message[space] = 'F';
                    }
                }
            }
            packet.message['gameOver'] = game.gameOver
        }
        else if( action == 'probe' ){
            const row = req.query.row
            const col = req.query.col
            if( row > 0 && row < game.rows &&
                col > 0 && col < game.cols     ){
                
                packet.message = game.getSpace(row, col); 
            }
            else {
                packet.status = 'error';
                packet.message = 'Invalid row or column';
            }
        }
        else {
            packet.status = 'error';
            packet.message = 'Invalid Action';
        }

    }
    res.send(JSON.stringify(packet))
})

app.listen(PORT, function() {
    console.log(`Server started on port ${PORT}`)
})
