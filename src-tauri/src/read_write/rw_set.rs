use serde::{Deserialize, Serialize};
use std::{fs, path::Path};

#[derive(Debug, Deserialize, Serialize)]
#[serde(tag = "type", content = "value")]
pub enum SettingValue {
    String(String),
    Number(f64),
    Boolean(bool),
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Setting {
    key: String,
    value: SettingValue,
    description: String,
}

fn read_settings_json(path: &Path) -> std::io::Result<Vec<Setting>> {
    let json_list = fs::read_to_string(path)?;
    let settings = serde_json::from_str::<Vec<Setting>>(&json_list)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    Ok(settings)
}

#[tauri::command]
pub fn get_settings(root: String) -> Result<Vec<Setting>, String> {
    let path = Path::new(&root);
    read_settings_json(path).map_err(|e| format!("Failed to read: `{}`: {}", root, e))
}

#[tauri::command]
pub fn write_settings(root: String, settings: Vec<Setting>) -> Result<(), String> {
    let data = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Serialization error: {}", e))?;
    fs::write(&root, data).map_err(|e| format!("Failed to write: `{}`: {}", root, e))?;
    Ok(())
}
