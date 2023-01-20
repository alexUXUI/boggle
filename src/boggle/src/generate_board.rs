use js_sys::Math;
use wasm_bindgen::prelude::*;

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

    // add the i's
    for _ in 0..2 {
        board_string.push('I');
    }

    // add the a's
    for _ in 0..2 {
        board_string.push('A');
    }

    // add the t's
    for _ in 0..2 {
        board_string.push('T');
    }

    // add the c
    board_string.push('C');

    // add the n
    board_string.push('N');

    // add the r
    board_string.push('R');

    // add the s
    board_string.push('S');

    // add the b
    board_string.push('B');

    // add the d
    board_string.push('D');

    // add the h
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
    // new_board_string = new_board_string.to_lowercase();

    new_board_string = "CART".to_string();

    new_board_string
}
