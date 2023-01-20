use crate::TrieStruct;

// given a board and a trie find all the words in the board
pub fn solve_board(board: Vec<Vec<char>>, trie: &mut TrieStruct) -> Vec<String> {
    let mut words = Vec::new();

    for row in 0..board.len() {
        for col in 0..board[row].len() {
            let visited = vec![vec![false; board[row].len()]; board.len()];
            let mut word = String::new();

            solve_board_helper(
                board.clone(),
                row,
                col,
                visited,
                &mut word,
                trie,
                &mut words,
            );
        }
    }

    words
}

// given a board, a row, a column, a visited matrix, a word, a trie, and a vector of words
// solve the board
fn solve_board_helper(
    board: Vec<Vec<char>>,
    row: usize,
    col: usize,
    mut visited: Vec<Vec<bool>>,
    word: &mut String,
    trie: &mut TrieStruct,
    words: &mut Vec<String>,
) {
    // if the row or column is out of bounds, return
    if row >= board.len() || col >= board[row].len() {
        return;
    }

    // if the current cell has already been visited, return
    if visited[row][col] {
        return;
    }

    // add the current letter to the word
    word.push(board[row][col]);

    // if the word is not in the trie, return
    if !trie.is_prefix(word) {
        return;
    }

    // if the word is in the trie and is at least 3 letters long, add it to the words vector
    if trie.is_word(word) && word.len() >= 3 {
        words.push(word.clone());
    }

    // mark the current cell as visited
    visited[row][col] = true;

    // recursively call the function on the adjacent cells
    solve_board_helper(
        board.clone(),
        row + 1,
        col,
        visited.clone(),
        word,
        trie,
        words,
    );
    solve_board_helper(
        board.clone(),
        row - 1,
        col,
        visited.clone(),
        word,
        trie,
        words,
    );
    solve_board_helper(
        board.clone(),
        row,
        col + 1,
        visited.clone(),
        word,
        trie,
        words,
    );
    solve_board_helper(
        board.clone(),
        row,
        col - 1,
        visited.clone(),
        word,
        trie,
        words,
    );
    // handle diagonals
    solve_board_helper(
        board.clone(),
        row + 1,
        col + 1,
        visited.clone(),
        word,
        trie,
        words,
    );
    solve_board_helper(
        board.clone(),
        row - 1,
        col - 1,
        visited.clone(),
        word,
        trie,
        words,
    );
    solve_board_helper(
        board.clone(),
        row + 1,
        col - 1,
        visited.clone(),
        word,
        trie,
        words,
    );
    solve_board_helper(
        board.clone(),
        row - 1,
        col + 1,
        visited.clone(),
        word,
        trie,
        words,
    );

    // remove the last letter from the word
    word.pop();
}
