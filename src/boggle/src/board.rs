use js_sys::Math;
use rand::{thread_rng, Rng};
use wasm_bindgen::prelude::*;

struct Board {
    data: Vec<Vec<char>>,
}

impl Board {
    fn get(&self) -> &Vec<Vec<char>> {
        &self.data
    }

    fn set(&mut self, board: Vec<Vec<char>>) {
        self.data = board;
    }
}

const BOARD: Board = Board { data: Vec::new() };

fn random_char() -> char {
    let mut rng = thread_rng();
    rng.gen_range('a'..='z')
}

pub fn generate_board(board_size: u8) -> Vec<Vec<char>> {
    // provision a vector to hold the board
    let mut board: Vec<Vec<char>> = Vec::new();

    // generate a random board
    for i in 0..board_size {
        let mut row = Vec::new();

        for _ in 0..board_size {
            row.push(random_char());
        }

        board.push(row);
    }

    BOARD.set(board.clone());

    board
}

pub fn generate_board_from_string(string: String) -> Vec<Vec<char>> {
    let mut board: Vec<Vec<char>> = Vec::new();

    let mut row = Vec::new();

    for (i, c) in string.chars().enumerate() {
        row.push(c);

        if (i + 1) % 5 == 0 {
            board.push(row);
            row = Vec::new();
        }
    }

    BOARD.set(board.clone());

    board
}

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

    BOARD.set(board.clone());

    board
}

#[wasm_bindgen]
pub fn gerenate_board_string() -> String {
    let mut board_string = String::new();

    let consonants = vec![
        'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W',
        'X', 'Y', 'Z',
    ];

    for _ in 0..5 {
        board_string.push('E');
    }

    for _ in 0..2 {
        board_string.push('I');
    }

    for _ in 0..2 {
        board_string.push('A');
    }

    for _ in 0..2 {
        board_string.push('T');
    }

    board_string.push('C');
    board_string.push('N');
    board_string.push('R');
    board_string.push('S');
    board_string.push('B');
    board_string.push('D');
    board_string.push('H');

    // add the rest of the letters
    for _ in 0..(25 - board_string.len()) {
        let random_number = Math::random();
        let random_number = random_number * 21.0;
        let random_number = random_number.floor();
        let random_number = random_number as u32;

        board_string.push(consonants[random_number as usize]);
    }

    // reorder the string randomly
    let mut new_board_string = String::new();

    for _ in 0..25 {
        let random_number = Math::random();
        let random_number = random_number * board_string.len() as f64;
        let random_number = random_number.floor();
        let random_number = random_number as u32;

        new_board_string.push(board_string.remove(random_number as usize));
    }

    // make the string lowercase
    new_board_string = new_board_string.to_lowercase();
    new_board_string
}
