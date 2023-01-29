
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    // alert(&format!("Hello, {}!", name));
    let response: String = "Hello, ".to_string();

    response
}