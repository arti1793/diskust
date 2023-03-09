cd diskust;

npm install;
cargo install tauri-cli;

cargo +nightly tauri build;
# result is in /target/release