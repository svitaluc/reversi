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

function renderBoard() {
    if(!ctx) return;
    for(var y = 0; y < 8; y++) {
        for(var x = 0; x < 8; x++) {
            renderSquare(x, y);
        }
    }
}

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

function renderLegalMoves(){
    state.legalMoves.forEach(function(field){
        renderLegalMove(field.x, field.y);
    });
}

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
        var text = "IT'S A TIE!\n"+bcount+" to "+wcount;
    }
    else {
        if (bcount > wcount) {
            text = "BLACK WINS!\n"+bcount+" to "+wcount;
        }
        else {
            text = "WHITE WINS!\n"+wcount+" to "+bcount;
        }
    }

}

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

function isInLegalMoves(x, y) {
    if (!state.legalMoves)
        return false;
    for(var i = 0; i < state.legalMoves.length; i++){
        if (state.legalMoves[i].x === x && state.legalMoves[i].y === y)
            return true;
    }
    return false;
}

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

function updateLegalMoves(x, y) {
    for (var i = 0; i < state.legalMoves.length; i++){
        if(state.legalMoves[i].x === x && state.legalMoves[i].y === y) {
            continue;
        }
        renderSquare(state.legalMoves[i].x, state.legalMoves[i].y);
    }
    showMoves();
}

function handleMouseDown(event){
    var x = Math.floor(event.clientX/size*2);
    var y = Math.floor(event.clientY/size*2);

    if (!isInLegalMoves(x, y))
        return;

    state.board[y][x] = state.turn;
    animateChange(x, y);
    flipDisks(x, y);

    //TODO zkontrolovat stav
    state.highlighted = null;
    updateLegalMoves(x, y);
}

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