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
use wasm_bindgen_futures::JsFuture;
use web_sys::Request;
use web_sys::RequestInit;
use web_sys::RequestMode;
use web_sys::Response;



#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // The `console.log` is quite polymorphic, so we can bind it with multiple
    // signatures. Note that we need to use `js_name` to ensure we always call
    // `log` in JS.
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);

    // Multiple arguments too!
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);

    fn alert(s: &str);
}


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
pub async fn run_game(dictionary: js_sys::Array, board: js_sys::JsString) -> js_sys::Array {
    // print the board  using format
    log(&format!("Board: {:?}", board));


    // Trie
    let mut trie = TrieStruct::create();

    for i in 0..dictionary.length() {
        trie.insert(dictionary.get(i).as_string().unwrap());
    }

    // print the trie using format
    // log(&format!("Trie: {:?}", trie));

    let board_from_string = generate_board_from_string(board.into());

    // print the board_from_string using format
    // log(&format!("Board: {:?}", board_from_string));

    // given the board and the trie, solve the board
    let answers = find_words(board_from_string, &mut trie);

    // convert the answers into a js array
    let array = js_sys::Array::new();

    for answer in answers {
        array.push(&JsValue::from(answer));
    }

    array
}
