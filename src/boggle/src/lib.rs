mod generate_board;
mod trie;

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response};

use generate_board::gerenate_board_string;
use trie::TrieStruct;

pub async fn get_data() -> Result<js_sys::Array, JsValue> {
    let mut opts = RequestInit::new();
    opts.method("GET");
    opts.mode(RequestMode::Cors);

    let url = format!("https://boggle.pages.dev/engmix.txt");

    let request = Request::new_with_str_and_init(&url, &opts)?;

    request.headers().set("Accept", "text/plain")?;

    let window = web_sys::window().unwrap();
    let resp_value = JsFuture::from(window.fetch_with_request(&request)).await?;

    // `resp_value` is a `Response` object.
    let text: Response = resp_value.dyn_into().unwrap();

    // Convert this other `Promise` into a rust `Future`.
    let text_promise = JsFuture::from(text.text().unwrap());

    // Wait for the response of the fetch.
    let text_value = text_promise.await?;

    // Convert to a `String`.
    let text_string = text_value.as_string().unwrap();

    // remove all the new lines and split the string into an array
    let cleaned_data = text_string
        .replace("\r", "")
        .replace("\n", " ")
        .split(" ")
        .map(|s| s.to_string())
        .collect::<Vec<String>>();

    // create new js array
    let array = js_sys::Array::new();

    // push each word into the array
    for word in cleaned_data {
        array.push(&JsValue::from(word));
    }

    Ok(array)
}

#[wasm_bindgen]
pub async fn run_the_world() -> js_sys::Array {
    // Get dictionary data over HTTP
    let data = get_data().await.unwrap();

    // Create Trie to hold the dictionary data
    let mut trie_test = TrieStruct::create();

    // Add data to trie by iterating through the array of data
    for word in data.iter() {
        trie_test.insert(word.as_string().unwrap());
    }

    // Generate a random board
    let board_string = gerenate_board_string();

    // convert the board string into a 5x5 matrix
    let board_matrix = board_string
        .chars()
        .collect::<Vec<char>>()
        .chunks(5)
        .map(|s| s.to_vec())
        .collect::<Vec<Vec<char>>>();

    // solve the board
    let words = solve_board(board_matrix, &mut trie_test);

    // return the words as a js array
    let array = js_sys::Array::new();

    for word in words {
        array.push(&JsValue::from(word));
    }

    array
}

pub fn solve_board(board: Vec<Vec<char>>, trie: &mut TrieStruct) -> Vec<String> {
    let mut words = Vec::new();

    for row in 0..board.len() {
        for col in 0..board[row].len() {
            let mut visited = vec![vec![false; board[row].len()]; board.len()];
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

pub fn solve_board_helper(
    board: Vec<Vec<char>>,
    row: usize,
    col: usize,
    mut visited: Vec<Vec<bool>>,
    word: &mut String,
    trie: &mut TrieStruct,
    words: &mut Vec<String>,
) {
    if row < 0 || row >= board.len() || col < 0 || col >= board[row].len() {
        return;
    }

    if visited[row][col] {
        return;
    }

    word.push(board[row][col]);

    if !trie.is_prefix(word) {
        word.pop();
        return;
    }

    if trie.is_word(word) {
        words.push(word.clone());
    }

    visited[row][col] = true;

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

    // handle the diagonals
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

    solve_board_helper(
        board.clone(),
        row - 1,
        col - 1,
        visited.clone(),
        word,
        trie,
        words,
    );

    word.pop();
    visited[row][col] = false;
}

#[wasm_bindgen]
pub fn test_trie() {
    // Create Trie
    let mut trie_test = TrieStruct::create();

    // Insert Stuff
    trie_test.insert("Test".to_string());
    trie_test.insert("Tea".to_string());
    trie_test.insert("Background".to_string());
    trie_test.insert("Back".to_string());
    trie_test.insert("Brown".to_string());
}

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}
