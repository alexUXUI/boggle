/**
 * Given a string of chars and a board size, generate a board from the string
 * using the size as the length and width of the board matrix.
 */
pub fn generate_board_from_string(string: String) -> Vec<Vec<char>> {
    let string_length = string.len();
    let board_size = (string_length as f64).sqrt() as usize;
    let mut board: Vec<Vec<char>> = Vec::new();

    for i in 0..board_size {
        let mut row: Vec<char> = Vec::new();

        for j in 0..board_size {
            let index = (i * board_size) + j;
            row.push(string.chars().nth(index).unwrap());
        }

        board.push(row);
    }

    board
}

#[test]
fn test_generate_board_from_string() {
    let board_string: &str = "cane";
    let board_size: usize = 2;
    let board = generate_board_from_string(board_string.to_string());
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
