// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// use tauri::{TitleBarStyle, WebviewUrl, WebviewWindowBuilder};
mod rw_dirs;
mod rw_sems;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            rw_dirs::get_file_tree,
            rw_sems::get_courses,
            rw_sems::write_semester_json,
        ])
        // .setup(|app| {
        //     // ----- MacOS : Hide Titlebar ----- //
        //     #[cfg(target_os = "macos")] // was not here
        //     let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        //         .title("What's My Grade")
        //         .inner_size(800.0, 600.0);
        //
        //     // set transparent title bar only when building for macOS
        //     #[cfg(target_os = "macos")]
        //     let win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);
        //
        //     #[cfg(target_os = "macos")] // was not here
        //     let window = win_builder.build().unwrap();
        //
        //     // set background color only when building for macOS
        //     #[cfg(target_os = "macos")]
        //     {
        //         use cocoa::appkit::{NSColor, NSWindow};
        //         use cocoa::base::{id, nil};
        //
        //         let ns_window = window.ns_window().unwrap() as id;
        //         unsafe {
        //             let bg_color = NSColor::colorWithRed_green_blue_alpha_(
        //                 nil,
        //                 14.0 / 255.0,
        //                 18.0 / 255.0,
        //                 36.0 / 255.0,
        //                 1.0,
        //             );
        //             ns_window.setBackgroundColor_(bg_color);
        //         }
        //     }
        //
        //     Ok(())
        // })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
