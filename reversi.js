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
    border: [
        {y: 2, x: 2},
        {y: 2, x: 3},
        {y: 2, x: 4},
        {y: 2, x: 5},
        {y: 3, x: 2},
        {y: 3, x: 5},
        {y: 4, x: 2},
        {y: 4, x: 5},
        {y: 5, x: 2},
        {y: 5, x: 3},
        {y: 5, x: 4},
        {y: 5, x: 5}
    ],
    turn: 'b',
    legalMoves: [],
    highlighted: null
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

function renderSquare(x, y) {
    if((x + y) % 2 == 1) {
        ctx.fillStyle = '#006400';
    }
    else {
        ctx.fillStyle = '#00AA00'
    }
    ctx.fillRect(x*size, y*size, size, size);
    if(state.board[y][x]) {
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
    ctx.arc(x*size+size/2, y*size+size/2, size/2 - 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
}

function renderLegalMoves(){
    state.legalMoves.forEach(function(field){
        renderLegalMove(field.x, field.y);
    });
}

function showMoves() {
    state.legalMoves = [];
    state.border.forEach(function(field){
        directions.forEach(function(direction){
            var x = field.x + direction.x;
            var y = field.y + direction.y;
            if (x > -1 && x < 9 && y > -1 && y < 9){
                if(state.board[y][x] && state.board[y][x] !== state.turn){
                    for(var i = x + direction.x, j = y + direction.y; i > -1, i < 9, j > -1, j < 9; i += direction.x, j += direction.y){
                        if(!state.board[j][i])
                            break;
                        if(state.board[j][i] === state.turn){
                            state.legalMoves.push({y: field.y, x: field.x});
                        }
                    }
                }
            }
        })
    });
    //TODO case when no legal moves are available (need to pass)
    renderLegalMoves();
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
        for (var i = x + direction.x, j = y + direction.y; i > -1, i < 9, j > -1, j < 9; i += direction.x, j += direction.y) {
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

        recolor.forEach(function(field){
            state.board[field.y][field.x] = state.turn;
            ctx.clearRect(field.x * size, field.y * size, size, size);
            renderSquare(field.x, field.y);
        });
    });
    state.turn = state.turn === 'b' ? 'w' : 'b';
}

function updateLegalMoves(x, y) {
    for (var i = 0; i < state.border.length; i++){
        if(state.border[i].x === x && state.border[i].y === y) {
            state.border.splice(i, 1);
        }
    }

    directions.forEach(function(direction){
        var x = x + direction.x;
        var y = y + direction.y;
        if (x > -1 && x < 9 && y > -1 && y < 9 && !state.board[y][x]){
            state.border.push({y: y, x: x});
        }
    });

    for (i = 0; i < state.legalMoves.length; i++){
        ctx.clearRect(state.legalMoves[i].x*size, state.legalMoves[i].y*size, size, size);
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
    ctx.clearRect(x*size, y*size, size, size);
    renderSquare(x, y);
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