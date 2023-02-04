/**
 * Given a string of chars and a board size, generate a board from the string
 * using the size as the length and width of the board matrix.
 */
pub fn generate_board_from_string(string: String, board_size: usize) -> Vec<Vec<char>> {
    let mut board: Vec<Vec<char>> = Vec::new();
    let mut row: Vec<char> = Vec::new();

    for (i, c) in string.chars().enumerate() {
        row.push(c);

        if (i + 1) % board_size == 0 {
            board.push(row);
            row = Vec::new();
        }
    }

    board
}

#[test]
fn test_generate_board_from_string() {
    let board_string: &str = "cane";
    let board_size: usize = 2;
    let board = generate_board_from_string(board_string.to_string(), board_size);
    let expected_board: Vec<Vec<char>> = vec![vec!['c', 'a'], vec!['r', 'e']];

    assert_eq!(board, expected_board);
}

/**
 * Generate a fixed board for testing purposes
 * this board has over 200 words given large dictionarys
 */
pub fn generate_fixed_board() -> Vec<Vec<char>> {
    let mut board: Vec<Vec<char>> = Vec::new();

    let row1 = vec!['e', 'd', 'r', 'e', 's'];
    let row2 = vec!['b', 'l', 'o', 'a', 'i'];
    let row3 = vec!['e', 'a', 'e', 'r', 'w'];
    let row4 = vec!['m', 'i', 't', 'e', 'h'];
    let row5 = vec!['s', 'n', 'a', 's', 'd'];

    board.push(row1);
    board.push(row2);
    board.push(row3);
    board.push(row4);
    board.push(row5);

    board
}
