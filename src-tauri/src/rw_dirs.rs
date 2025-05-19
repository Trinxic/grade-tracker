use serde::{Deserialize, Serialize};
use std::{fs, path::Path};

#[derive(Serialize)]
pub struct FileNode {
    name: String,
    is_directory: bool,
    children: Option<Vec<FileNode>>,
}

fn read_dir_recursive(path: &Path) -> std::io::Result<FileNode> {
    let meta = fs::metadata(path)?;
    let name = path
        .file_name()
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_else(|| String::from(""));

    if meta.is_dir() {
        let mut children = Vec::new();
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let child_node = read_dir_recursive(&entry.path())?;
            children.push(child_node);
        }
        Ok(FileNode {
            name,
            is_directory: true,
            children: Some(children),
        })
    } else {
        Ok(FileNode {
            name,
            is_directory: false,
            children: None,
        })
    }
}

#[tauri::command]
pub fn get_file_tree(root: String) -> Result<FileNode, String> {
    let path = Path::new(&root);
    read_dir_recursive(path).map_err(|e| format!("Failed to read: `{}`: {}", root, e))
}
