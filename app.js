const boardSize = 3;
const boardElement = document.getElementById("board");

for (let i = 0; i < boardSize * boardSize; i++) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.textContent = "";
  cell.addEventListener("click", () => {
    cell.textContent = "★";
  });
  boardElement.appendChild(cell);
}
