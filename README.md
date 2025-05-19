# Tauri + Angular

This template should help get you started developing with Tauri and Angular.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) + [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template).

### Change for final..?

```toml title:src-tauri/Cargo.toml
[target."cfg(target_os = \"macos\")".dependencies]
cocoa = "0.26"
```

```rs title:src-tauri/src/lib.rs
// all the stuff under .setup(|app| { ... })
```
