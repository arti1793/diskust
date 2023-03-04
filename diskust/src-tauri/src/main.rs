// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::path::Path;

use api::Diskust;
use serde_json::json;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_nodes(pathstr: &str) -> String {
    let root = Diskust::new(Path::new(pathstr)).unwrap();
    json!(root).to_string()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_nodes])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
