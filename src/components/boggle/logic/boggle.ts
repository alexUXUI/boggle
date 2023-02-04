import { trie } from './trie';

export const convertStringToMatrix = (letters: string) => {
  const stringLength = letters.length;
  const squareRoot = Math.sqrt(stringLength);
  const matrix = [];

  for (let i = 0; i < squareRoot; i++) {
    const row = letters.substr(i * squareRoot, squareRoot).split('');
    matrix.push(row);
  }

  return matrix;
};

// Get cell neighbors (up, down, left, right, diagonal)
export const getNeighbors = (board: string[][], row: number, col: number) => {
  const neighbors = [];

  const topNeighbor = row - 1;
  const bottomNeighbor = row + 1;
  const leftNeighbor = col - 1;
  const rightNeighbor = col + 1;
  const topRightNeighbor = [topNeighbor, rightNeighbor];
  const topLeftNeighbor = [topNeighbor, leftNeighbor];
  const bottomRightNeighbor = [bottomNeighbor, rightNeighbor];
  const bottomLeftNeighbor = [bottomNeighbor, leftNeighbor];

  if (topNeighbor >= 0) {
    neighbors.push([topNeighbor, col]);
  }

  if (bottomNeighbor < board.length) {
    neighbors.push([bottomNeighbor, col]);
  }

  if (leftNeighbor >= 0) {
    neighbors.push([row, leftNeighbor]);
  }

  if (rightNeighbor < board[0].length) {
    neighbors.push([row, rightNeighbor]);
  }

  if (topRightNeighbor[0] >= 0 && topRightNeighbor[1] < board[0].length) {
    neighbors.push(topRightNeighbor);
  }

  if (topLeftNeighbor[0] >= 0 && topLeftNeighbor[1] >= 0) {
    neighbors.push(topLeftNeighbor);
  }

  if (
    bottomRightNeighbor[0] < board.length &&
    bottomRightNeighbor[1] < board[0].length
  ) {
    neighbors.push(bottomRightNeighbor);
  }

  if (bottomLeftNeighbor[0] < board.length && bottomLeftNeighbor[1] >= 0) {
    neighbors.push(bottomLeftNeighbor);
  }

  return neighbors;
};

// Depth first search
export const getWords = (board: string[][], trie: any): string[] => {
  // found words
  const words = new Set();

  // visited cells
  const visited = new Set();

  // given a cell,
  const search = (
    row: number,
    col: number,
    prefix: string,
    visited: Set<string>
  ) => {
    const letter = board[row][col];

    const newPrefix = prefix + letter;

    if (!trie.containsPrefix(newPrefix)) {
      return;
    }

    if (trie.containsWord(newPrefix)) {
      words.add(newPrefix);
    }

    const neighbors = getNeighbors(board, row, col);

    neighbors.forEach((neighbor) => {
      const [neighborRow, neighborCol] = neighbor;

      if (visited.has(neighborRow + '-' + neighborCol)) {
        return;
      }

      visited.add(neighborRow + '-' + neighborCol);
      visited.add(row + '-' + col);

      // wind up the search stack
      search(neighborRow, neighborCol, newPrefix, visited as Set<string>);

      // unwind the stack by clearing the visited set
      visited.delete(neighborRow + '-' + neighborCol);
      visited.delete(row + '-' + col);
    });
  };

  // for each cell in the board search for words
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      search(row, col, '', visited as Set<string>);
    }
  }

  return Array.from(words) as string[];
};

export const solve = (words: string[], board: string[]): string[] => {
  let results: string[] = [];

  try {
    // build a trie from the dictionary
    words.forEach((word: string) => trie.add(word));
    // convert the board string to a 2D matrix
    const stringToMatrix = convertStringToMatrix(board.join(''));
    // get the words from the board
    const foundWords = getWords(stringToMatrix, trie);
    // sort the words
    results = Array.from(foundWords).sort();
  } catch (error) {
    console.log(error);
  }

  return results;
};
