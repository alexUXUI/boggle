use crate::TrieStruct;

pub fn find_words(board: Vec<Vec<char>>, trie: &mut TrieStruct) -> Vec<String> {
    let mut found_words: Vec<String> = Vec::new();

    // create an empty prefix char vector to hold the current prefix
    let mut empty_startng_prefix: Vec<char> = Vec::new();

    let mut visited_cells: Vec<(usize, usize)> = Vec::new();

    // iterate through each cell on the board
    for row in 0..board.len() {
        for col in 0..board[row].len() {
            // DFS find words for each cell
            find_words_from_cell(
                board.clone(),
                row,
                col,
                &mut empty_startng_prefix,
                trie,
                &mut found_words,
                &mut visited_cells,
            );
        }
    }

    found_words
}

fn find_words_from_cell(
    board: Vec<Vec<char>>,
    row: usize,
    col: usize,
    current_prefix: &mut Vec<char>,
    trie: &mut TrieStruct,
    words: &mut Vec<String>,
    visited_cells: &mut Vec<(usize, usize)>
) {

    // get the current letter
    let current_letter: char = board[row][col];

    // generate a new prefix by adding the current letter to the prefix
    let mut new_prefix: Vec<char> = current_prefix.clone();
    new_prefix.push(current_letter);

    // transform the new prefix into a string
    let mut prefix_string: String = new_prefix.iter().collect();

    // short circuit if the trie does not contain the prefix string
    if !trie.is_prefix(&mut prefix_string) {
        return;
    }

    // if the prefix string is a word
    let is_prefix_a_word = trie.is_word(&mut prefix_string);

    // and the word does not already exist in the words vector
    let word_does_not_exist = !words.contains(&prefix_string);

    // add the word to the words vector
    if word_does_not_exist && is_prefix_a_word {
        words.push(prefix_string);
    }

    // get cell neighbors
    let neighbors = get_valid_neighbors(board.clone(), row, col, visited_cells);

    // iterate through the neighbors
    for neighbor in neighbors {

        // short circuit if the neighbor has already been visited
        // the vector contains a tuple so make sure to check both the tuple values for a match
        // visited_cells.contains(&neighbor) does not work
        if visited_cells.contains(&(neighbor.0, neighbor.1)) {
            continue;
        }

        // mark self as visited
        visited_cells.push((row, col));
        // mark neighbor as visited
        visited_cells.push(neighbor);

        find_words_from_cell(
            board.clone(),
            neighbor.0,
            neighbor.1,
            &mut new_prefix,
            trie,
            words,
            visited_cells,
        );

        // unmark self as visited
        visited_cells.pop();
        // unmark neighbor as visited
        visited_cells.pop();
    }
}

fn get_valid_neighbors(board: Vec<Vec<char>>, row: usize, col: usize, visited_cells: &mut Vec<(usize, usize)>) -> Vec<(usize, usize)> {
    let mut neighbors: Vec<(usize, usize)> = Vec::new();

    // return all valid neighbors, dont add cells that have already been visited and handle diagonal neighbors
    if row > 0 && col > 0 && !visited_cells.contains(&(row - 1, col - 1)) {
        neighbors.push((row - 1, col - 1));
    }
    if row > 0 && !visited_cells.contains(&(row - 1, col)) {
        neighbors.push((row - 1, col));
    }
    if row > 0 && col < board[row].len() - 1 && !visited_cells.contains(&(row - 1, col + 1)) {
        neighbors.push((row - 1, col + 1));
    }
    if col > 0 && !visited_cells.contains(&(row, col - 1)) {
        neighbors.push((row, col - 1));
    }
    if col < board[row].len() - 1 && !visited_cells.contains(&(row, col + 1)) {
        neighbors.push((row, col + 1));
    }
    if row < board.len() - 1 && col > 0 && !visited_cells.contains(&(row + 1, col - 1)) {
        neighbors.push((row + 1, col - 1));
    }
    if row < board.len() - 1 && !visited_cells.contains(&(row + 1, col)) {
        neighbors.push((row + 1, col));
    }
    if row < board.len() - 1 && col < board[row].len() - 1 && !visited_cells.contains(&(row + 1, col + 1)) {
        neighbors.push((row + 1, col + 1));
    }

    neighbors
}
