export const calculateCellWidth = (boardWidth: number, boardSize: number) => {
  switch (boardSize) {
    case 2:
      return boardWidth / boardSize - 40;
    case 3:
      return boardWidth / boardSize - 20;
    case 4:
      return boardWidth / boardSize - 12;
    case 5:
      return boardWidth / boardSize - boardSize * 2;
    case 6:
      return boardWidth / boardSize - boardSize - 2;
    case 7:
      return boardWidth / boardSize - 6;
    case 8:
      return boardWidth / boardSize - 6;
    case 9:
      return boardWidth / boardSize - 4;
    default:
      return boardWidth / boardSize - 2;
  }
};
