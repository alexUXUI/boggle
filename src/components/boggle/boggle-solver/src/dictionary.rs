use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response};

#[wasm_bindgen]
pub async fn get_dictionary() -> Result<js_sys::Array, JsValue> {
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

    let array = clean_data(text_string);

    Ok(array)
}

fn clean_data(text_string: String) -> js_sys::Array {
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

    array
}