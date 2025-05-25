use serde::Serialize;
use std::{fs, path::Path};

#[derive(Serialize)]
pub struct FileNode {
    path: String,
    stem: String,
    is_directory: bool,
    children: Option<Vec<FileNode>>,
}

fn read_dir_recursive(path: &Path, base: &Path) -> std::io::Result<FileNode> {
    let meta = fs::metadata(path)?;
    let rel_path = path
        .strip_prefix(base)
        .map(|p| p.to_string_lossy().into_owned())
        .unwrap_or_else(|_| String::new());

    let stem = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or_default()
        .to_string();

    let mut node = FileNode {
        path: rel_path,
        stem,
        is_directory: meta.is_dir(),
        children: None,
    };

    if meta.is_dir() {
        let mut children = Vec::new();
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            children.push(read_dir_recursive(&entry.path(), base)?);
        }
        node.children = Some(children);
    }

    Ok(node)
}

#[tauri::command]
pub fn get_file_tree(root: String) -> Result<FileNode, String> {
    let root_path = Path::new(&root);
    let base = root_path.parent().unwrap_or(root_path);
    read_dir_recursive(root_path, base).map_err(|e| format!("Failed to read: `{}`: {}", root, e))
}
