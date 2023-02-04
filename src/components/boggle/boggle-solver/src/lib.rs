mod board;
mod dictionary;
mod solver;
mod trie;

use board::generate_board_from_string;
use board::generate_fixed_board;
use dictionary::get_dictionary;
use solver::find_words;
use trie::TrieStruct;

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

pub fn matrix_to_js_array(vec: Vec<Vec<char>>) -> js_sys::Array {
    let array = js_sys::Array::new();

    for row in vec {
        let row_array = js_sys::Array::new();

        for letter in row {
            let letter_string = letter.to_string();
            row_array.push(&JsValue::from(letter_string));
        }

        array.push(&row_array);
    }

    array
}

pub fn matrix_to_string(board: js_sys::Array) -> String {
    let mut board_string = String::new();

    for i in 0..board.length() {
        let row = board.get(i).dyn_into::<js_sys::Array>().unwrap();
        for j in 0..row.length() {
            board_string.push_str(row.get(j).as_string().unwrap().as_str());
        }
    }

    board_string
}

#[wasm_bindgen]
pub fn get_board_string(board: js_sys::Array) -> String {
    matrix_to_string(board)
}

#[wasm_bindgen]
pub async fn run_game() -> js_sys::Array {
    // Dictionary
    let words = get_dictionary().await.unwrap();

    // Trie
    let mut trie = TrieStruct::create();

    for i in 0..words.length() {
        trie.insert(words.get(i).as_string().unwrap());
    }

    // Board
    // let board_string = generate_fixed_board();
    let board = generate_fixed_board();

    let js_array = matrix_to_js_array(board.clone());

    // given the board and the trie, solve the board
    let answers = find_words(board, &mut trie);

    // convert the answers into a js array
    let array = js_sys::Array::new();

    for answer in answers {
        array.push(&JsValue::from(answer));
    }

    array
}

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}