/**
 * Created by Lucka on 17.09.2017.
 */
var state = {
    board: [
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, 'w', 'b', null, null, null],
        [null, null, null, 'b', 'w', null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null]
    ],
    turn: 'b',
    legalMoves: [],
    highlighted: null,
    passed: false
};

var ctx;

var size = 128;

var directions = [
    {y: -1, x: -1}, {y: -1, x: 0}, {y: -1, x: 1},
    {y: 0, x: -1}, {y: 0, x: 1},
    {y: 1, x: -1}, {y: 1, x: 0}, {y: 1, x: 1}
];

/**@function renderDisk
 * Renders white or black arc in the square
 * @param x - x coordinate of the square where the disk should be drawn
 * @param y - y coordinate of the square where the disk should be drawn
 */
function renderDisk(x, y) {
    ctx.beginPath();
    if(state.board[y][x].charAt(0) === 'w') {
        ctx.fillStyle = '#fff';
    } else {
        ctx.fillStyle = '#000';
    }
    ctx.arc(x*size+size/2, y*size+size/2, size/2 - 10, 0, Math.PI * 2);
    ctx.fill();
}

/**@function animateChange
 * Animates change of the disk - either new or captured disk is first animated with running stroke line
 * @param x - x coordinate of the square where the disk should be animated
 * @param y - y coordinate of the square where the disk should be animated
 */
function animateChange(x, y){
    var endPercent = 110;
    var currentPercent = 0;
    ctx.lineWidth = 10;

    function animate(current) {
        ctx.beginPath();
        if(state.board[y][x].charAt(0) === 'w') {
            ctx.strokeStyle = '#fff';
        } else {
            ctx.strokeStyle = '#000';
        }
        ctx.arc(x*size+size/2, y*size+size/2, size/2 - 15, -(Math.PI / 2), ((Math.PI * 2) * current) - Math.PI / 2, false);
        ctx.stroke();
        currentPercent += 2;
        if (currentPercent < endPercent) {
            requestAnimationFrame(function () {
                animate(currentPercent / 100)
            });
        } else {
            ctx.clearRect(x*size, y*size, size, size);
            renderSquare(x,y);
        }
    }
    animate();
}

/**@function renderSquare
 * Renders a small green square. If a disk is present on that square, it redraws it as well.
 * @param x - x coordinate of the square to be rendered
 * @param y - y coordinate of the square to be rendered
 * @param noDisk - set true if no disk should be rendered in the square
 */
function renderSquare(x, y, noDisk) {
    if((x + y) % 2 == 1) {
        ctx.fillStyle = '#006400';
    }
    else {
        ctx.fillStyle = '#00AA00'
    }
    ctx.fillRect(x*size, y*size, size, size);
    if(state.board[y][x]) {
        if(noDisk)
            return;
        renderDisk(x, y);
    }
}

/**@function renderBoard
 * Renders the whole 8x8 game board.
 */
function renderBoard() {
    if(!ctx) return;
    for(var y = 0; y < 8; y++) {
        for(var x = 0; x < 8; x++) {
            renderSquare(x, y);
        }
    }
}

/**@function renderLegalMove
 * Renders all legal moves, that is a ring where a move is possible to be made.
 * @param x - x coordinate of the legal move
 * @param y - y coordinate of the legal move
 */
function renderLegalMove(x, y){
    ctx.clearRect(x*size, y*size, size, size);
    renderSquare(x, y);
    ctx.globalAlpha = 0.65;
    ctx.strokeStyle = state.turn === 'b'? 'black' : 'white';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(x * size + size / 2, y * size + size / 2, size / 2 - 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
}

/**@function renderLegalMoves
 * Renders all legal moves, that is rings where a move is possible to be made.
 */
function renderLegalMoves(){
    state.legalMoves.forEach(function(field){
        renderLegalMove(field.x, field.y);
    });
}

/**@function renderScoreBoard
 * Renders the final score board.
 * @param text - text describing a winner or a tie
 * @param score - actual score of the game
 */
function renderScoreBoard(text, score){
    ctx.clearRect(size, 2*size, 6*size, 3*size);
    ctx.fillStyle = '#006400';
    ctx.fillRect(size, 2*size, 6*size, 3*size);
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = "center";
    ctx.font = '90px arial';
    ctx.fillText(text, 4*size, 3*size);
    ctx.fillText(score,4*size,4*size);
}

/**@function renderGameOver
 * Handles all the rendering after the game is finished.
 */
function renderGameOver(){
    var bcount = 0;
    var wcount = 0;
    for(var i = 0; i < 8; i++){
        for(var j = 0; j < 8; j++){
            if(state.board[j][i] === 'b'){
                bcount++;
            }
            else if (state.board[j][i] === 'w'){
                wcount++
            }
        }
    }
    if (bcount === wcount){
        var text = "IT'S A TIE!";
        var score = bcount+" to "+wcount;
        setTimeout(function(){
            ctx.clearRect(0, 0, 8*size, 8*size);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, 4*size, 8*size);
            renderScoreBoard(text, score);
        }, 2000);
    }
    else {
        if (bcount > wcount) {
            text = "BLACK WINS!";
            score = bcount+" to "+wcount;
            var winner = 'b';
        }
        else {
            text = "WHITE WINS!";
            score = wcount+" to "+bcount;
            winner = 'w';
        }
        var currentPercent = 100;
        var endPercent = 700;

        function animate(current) {
            ctx.fillStyle = winner === 'w' ? '#fff' : '#000';
            for(var i = 0; i < 8; i++){
                for(var j = 0; j < 8; j++){
                    if(state.board[j][i].charAt(0) !== winner)
                        continue;
                    ctx.beginPath();
                    ctx.arc(i*size+size/2, j*size+size/2, (size/2 - 10)*current, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            renderScoreBoard(text,score);
            currentPercent += 0.25;
            if(currentPercent < endPercent){
                requestAnimationFrame(function(){
                    animate(currentPercent/100)
                })
            }
            else {
                ctx.clearRect(0, 0, 8*size, 8*size);
                ctx.fillStyle = winner === 'w' ? '#fff' : '#000';
                ctx.fillRect(0, 0, 8*size, 8*size);
                renderScoreBoard(text, score);
            }
        }
        setTimeout(function(){
            animate();
        }, 1500);
    }

}

/**@function resolveNoLegalMoves
 * Resolves the situation when no legal moves are available.
 */
function resolveNoLegalMoves(){
    if(state.passed){
        renderGameOver();
    }
    else {
        //player cannot do any move, the game is passed to the opponent
        state.turn = state.turn === 'b' ? 'w' : 'b';
        state.passed = true;
        showMoves();
    }
}

/**@function showMoves
 * Finds all legal moves and calls their rendering.
 */
function showMoves() {
    state.legalMoves = [];
    for(var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++){
            var field = {x: i, y: j};
            if(state.board[j][i])
                continue;
            directions.forEach(function(direction){
                var x = field.x + direction.x;
                var y = field.y + direction.y;
                if (x > -1 && x < 8 && y > -1 && y < 8){
                    if(state.board[y][x] && state.board[y][x] !== state.turn){
                        for(var i = x + direction.x, j = y + direction.y; (i > -1) && (i < 8) && (j > -1) && (j < 8); i += direction.x, j += direction.y){
                            if(!state.board[j][i])
                                break;
                            if(state.board[j][i] === state.turn){
                                state.legalMoves.push({y: field.y, x: field.x});
                            }
                        }
                    }
                }
            })
        }
    }
    if(state.legalMoves.length < 1){
        resolveNoLegalMoves();
    }
    else {
        renderLegalMoves();
        state.passed = false;
    }
}

/**@function isInLegalMoves
 * Checks if a move is a legal one.
 * @param x - x coordinate of the square to be checked
 * @param y - y coordinate of the square to be checked
 * @returns {boolean} - true if the move is legal, false otherwise
 */
function isInLegalMoves(x, y) {
    if (!state.legalMoves)
        return false;
    for(var i = 0; i < state.legalMoves.length; i++){
        if (state.legalMoves[i].x === x && state.legalMoves[i].y === y)
            return true;
    }
    return false;
}

/**@function handleMouseMove
 * Handles mouse hovering the board.
 * @param event - mouse event
 */
function handleMouseMove(event){
    var x = Math.floor(event.clientX/size*2);
    var y = Math.floor(event.clientY/size*2);

    if(state.highlighted){
        if(state.highlighted.x === x && state.highlighted.y === y)
            return;
        ctx.clearRect(state.highlighted.x*size, state.highlighted.y*size, size, size);
        renderSquare(state.highlighted.x, state.highlighted.y);
        renderLegalMove(state.highlighted.x, state.highlighted.y);
        state.highlighted = null;
    }

    if (isInLegalMoves(x, y)){
        ctx.clearRect(x*size, y*size, size, size);
        ctx.globalAlpha = 0.65;
        renderSquare(x, y);
        renderLegalMove(x, y);
        ctx.globalAlpha = 1.0;
        state.highlighted = {x: x, y: y};
    }
}

/**@function flipDisks
 * Flips all the disks that were captured by the move.
 * @param x - x coordinate of the new move which has been made
 * @param y - y coordinate of the new move which has been made
 */
function flipDisks(x, y){
    directions.forEach(function(direction){
        var recolor = [];
        for (var i = x + direction.x, j = y + direction.y; (i > -1) && (i < 8) && (j > -1) && (j < 8); i += direction.x, j += direction.y) {
            if (state.board[j][i]) {
                if (state.board[j][i] !== state.turn) {
                    recolor.push({y: j, x: i});
                }
                else {
                    break;
                }
            }
            else {
                recolor = [];
                return;
            }
        }
        // case in which we are on the border and the disk we reached is opponent's one -> there are no disks to recolor
        if(((i === 7) || (i === 0) || (j === 7) || (j === 0)) && ((i > -1) && (i < 8) && (j > -1) && (j < 8))){
            if(state.board[j][i] && state.board[j][i] !== state.turn)
                recolor = [];
        }

        recolor.forEach(function(field){
            state.board[field.y][field.x] = state.turn;
            animateChange(field.x, field.y);
        });
    });
    state.turn = state.turn === 'b' ? 'w' : 'b';
}

/**@function updateLegalMoves
 * Updates legal moves when the players switch
 * @param x - x coordinate of the last move
 * @param y - y coordinate of the last move
 */
function updateLegalMoves(x, y) {
    for (var i = 0; i < state.legalMoves.length; i++){
        if(state.legalMoves[i].x === x && state.legalMoves[i].y === y) {
            continue;
        }
        renderSquare(state.legalMoves[i].x, state.legalMoves[i].y);
    }
    showMoves();
}

/**@function handleMouseDown
 * Handles an action when the mouse button is clicked.
 * @param event - mouse event
 */
function handleMouseDown(event){
    var x = Math.floor(event.clientX/size*2);
    var y = Math.floor(event.clientY/size*2);

    if (!isInLegalMoves(x, y))
        return;

    state.board[y][x] = state.turn;
    animateChange(x, y);
    flipDisks(x, y);

    state.highlighted = null;
    updateLegalMoves(x, y);
}

/**@function setup
 * Sets the entire game up.
 */
function setup() {
    var canvas = document.createElement('canvas');
    canvas.width = size*8;
    canvas.height = size*8;
    canvas.onmousedown = handleMouseDown;
    canvas.onmousemove = handleMouseMove;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    renderBoard();
    showMoves();
}

setup();