// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::path::Path;

use api::{Diskust, Node};
use serde_json::json;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command(async)]
fn get_nodes(pathstr: &str) -> String {
    let root = Node::new(Path::new(pathstr)).unwrap(); // TODO;
    json!(root).to_string()
}
#[tauri::command(async)]
fn get_disks() -> String {
    let diskust = Diskust::new();

    json!(diskust.disks).to_string()
}
// #[tauri::command]
// async fn my_custom_command() {
//   // Call another async function and wait for it to finish
//   let result = some_async_function().await;
//   println!("Result: {}", result);
// }
fn main() {
    tauri::Builder::default()
        // .invoke_handler(tauri::generate_handler![get_nodes])
        .invoke_handler(tauri::generate_handler![get_disks, get_nodes])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
