const boardSize = 8;
let board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
let currentPlayer = 1; // 1: 黒, 2: 白

// 初期配置
board[3][3] = board[4][4] = 1; // 黒
board[3][4] = board[4][3] = 2; // 白

// 盤面を描画
function renderBoard() {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            
            if (board[i][j] === 1) cell.classList.add("black");
            if (board[i][j] === 2) cell.classList.add("white");
            
            cell.addEventListener("click", () => handleClick(i, j));
            boardElement.appendChild(cell);
        }
    }
}

// クリック処理（石を置く）
function handleClick(x, y) {
    if (board[x][y] !== 0) return; // 既に石がある場合は無視

    board[x][y] = currentPlayer;
    currentPlayer = currentPlayer === 1 ? 2 : 1; // プレイヤー交代
    renderBoard();
}

// 初期描画
renderBoard();