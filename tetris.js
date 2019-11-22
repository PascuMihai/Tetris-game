const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = (COLUMN = 10);
const SQ = (squareSize = 20);
const VACANT = "WHITE"; //Color of an empty square

// Draw a square

function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

  ctx.strokeStyle = "BLACK";
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// Create board

let board = [];
for (r = 0; r < ROW; r++) {
  board[r] = [];
  for (c = 0; c < COL; c++) {
    board[r][c] = VACANT;
  }
}

//

function drawBoard() {
  for (r = 0; r < ROW; r++) {
    for (c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c]);
    }
  }
}

drawBoard();

// the pieces and thier colors

const PIECES = [
  [Z, "red"],
  [S, "green"],
  [T, "yellow"],
  [O, "blue"],
  [L, "purple"],
  [I, "cyan"],
  [J, "orange"]
];

// Initiate the pieces
let p = randomPiece();

// Random piece

function randomPiece() {
  let r = Math.floor(Math.random() * PIECES.length); // 0 - 6
  return new Piece(PIECES[r][0], PIECES[r][1]);
}

// The object piece

function Piece(tetramino, color) {
  this.tetramino = tetramino;
  this.color = color;

  this.tetraminoN = 0; // we start with the first pattern
  this.activeTetramino = this.tetramino[this.tetraminoN];

  // we need to control the pieces
  this.x = 4;
  this.y = 4;
}

// fill function

Piece.prototype.fill = function(color) {
  for (r = 0; r < this.activeTetramino.length; r++) {
    for (c = 0; c < this.activeTetramino.length; c++) {
      // we draw only occupied spaces
      if (this.activeTetramino[r][c]) {
        drawSquare(this.x + c, this.y + r, color);
      }
    }
  }
};

//draw a piece to the board

Piece.prototype.draw = function() {
  this.fill(this.color);
};

// undraw the piece

Piece.prototype.unDraw = function() {
  this.fill(VACANT);
};

// move down the piece

Piece.prototype.moveDown = function() {
  if (!this.collision(0, 1, this.activeTetramino)) {
    this.unDraw();
    this.y++;
    this.draw();
  } else {
    // lock the piece
    this.lock();
    p = randomPiece();
  }
};

// more Right the piece

Piece.prototype.moveRight = function() {
  if (!this.collision(1, 0, this.activeTetramino)) {
    this.unDraw();
    this.x++;
    this.draw();
  } else {
    // lock the piece
  }
};

// more Left the piece

Piece.prototype.moveLeft = function() {
  if (!this.collision(-1, 0, this.activeTetramino)) {
    this.unDraw();
    this.x--;
    this.draw();
  } else {
  }
};
// Rotate the piece

Piece.prototype.rotate = function() {
  let nextPattern = this.tetramino[
    (this.tetraminoN + 1) % this.tetramino.length
  ];
  let kick = 0;

  if (this.collision(0, 0, nextPattern)) {
    if (this.x > COL / 2) {
      // its the right wall
      kick = -1; // move the piece to the left
    } else {
      // iths the left wall
      kick = 1;
    }
  }

  if (!this.collision(kick, 0, nextPattern)) {
    this.unDraw();
    this.x += kick;
    this.tetraminoN = (this.tetraminoN + 1) % this.tetramino.length;
    this.activeTetramino = this.tetramino[this.tetraminoN];
    this.draw();
  } else {
  }
};

// lock the pieces in place

let score = 0;

Piece.prototype.lock = function() {
  for (r = 0; r < this.activeTetramino.length; r++) {
    for (c = 0; c < this.activeTetramino.length; c++) {
      // we skip vacant squares
      if (!this.activeTetramino[r][c]) {
        continue;
      }
      // piece lock on top of the board
      if (this.y + r < 0) {
        alert("Game Over");
        //stop the animation frame
        gameOver = true;
        break;
      }
      // we lock the piece
      board[this.y + r][this.x + c] = this.color;
    }
  }
  // remove full rows
  for (r = 0; r < ROW; r++) {
    let isRowFull = true;
    for (c = 0; c < COL; c++) {
      isRowFull = isRowFull && board[r][c] != VACANT;
    }
    if (isRowFull) {
      //we move all the rows down
      for (y = r; y > 1; y--) {
        for (c = 0; c < COL; c++) {
          board[y][c] = board[y - 1][c];
        }
      }
      // the top row have no row above it
      for (c = 0; c < COL; c++) {
        board[0][c] = VACANT;
      }
      // increment the score with 10 points
      score += 10;
    }
  }
  // update the board
  drawBoard();
  // update the score
  scoreElement.innerHTML = score;
};

// Collision function

Piece.prototype.collision = function(x, y, piece) {
  for (r = 0; r < piece.length; r++) {
    for (c = 0; c < piece.length; c++) {
      // if the square if empty
      if (!piece[r][c]) {
        continue;
      }
      // coordinates of the piece of the movement
      let newX = this.x + c + x;
      let newY = this.y + r + y;

      //conditions
      if (newX < 0 || newX >= COL || newY >= ROW) {
        return true;
      }
      // skip newY < 0; board[-1] will crush our game
      if (newY < 0) {
        continue;
      }
      //check if a piece is allready in place
      if (board[newY][newX] != VACANT) {
        return true;
      }
    }
  }
  return false;
};

// Control the piece

document.addEventListener("keydown", CONTROL);

function CONTROL(e) {
  if (event.keyCode == 37) {
    p.moveLeft();
    dropStart = Date.now();
  } else if (event.keyCode == 38) {
    p.rotate();
    dropStart = Date.now();
  } else if (event.keyCode == 39) {
    p.moveRight();
    dropStart = Date.now();
  } else if (event.keyCode == 40) {
    p.moveDown();
    dropStart = Date.now();
  }
}

//drop the piece every 1 second

let dropStart = Date.now();
let gameOver = false;

function drop() {
  let now = Date.now();
  let delta = now - dropStart;
  if (delta > 1000) {
    p.moveDown();
    dropStart = Date.now();
  }
  if (!gameOver) {
    requestAnimationFrame(drop);
  }
}

drop();
