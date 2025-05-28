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
        let mut entries: Vec<_> = fs::read_dir(path)?.filter_map(|r| r.ok()).collect();

        entries.sort_by(|a, b| {
            let am = a.file_type().map(|t| t.is_dir()).unwrap_or(false);
            let bm = b.file_type().map(|t| t.is_dir()).unwrap_or(false);
            match (am, bm) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => a
                    .file_name()
                    .to_string_lossy()
                    .cmp(&b.file_name().to_string_lossy()),
            }
        });

        let children = entries
            .into_iter()
            .filter_map(|entry| read_dir_recursive(&entry.path(), base).ok())
            .collect();
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
