use serde::{Deserialize, Serialize};
use std::{fs, path::Path};

#[derive(Debug, Deserialize, Serialize)]
pub struct Assessment {
    pub assessment: String,
    pub grade: f64,
    pub weight: f64,
    pub contribution: Option<f64>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GradeBook {
    pub index: u32,
    #[serde(rename = "courseName")]
    pub course_name: String,
    pub assessments: Vec<Assessment>,
}

fn read_semester_json(path: &Path) -> std::io::Result<Vec<GradeBook>> {
    let json_list = fs::read_to_string(path)?;
    let grade_books = serde_json::from_str::<Vec<GradeBook>>(&json_list)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    Ok(grade_books)
}

#[tauri::command]
pub fn get_courses(root: String) -> Result<Vec<GradeBook>, String> {
    let path = Path::new(&root);
    read_semester_json(path).map_err(|e| format!("Failed to read: `{}`: {}", root, e))
}

#[tauri::command]
pub fn write_semester_json(root: String, grade_books: Vec<GradeBook>) -> Result<(), String> {
    let data = serde_json::to_string_pretty(&grade_books)
        .map_err(|e| format!("Serialization error: {}", e))?;
    fs::write(&root, data).map_err(|e| format!("Failed to write: `{}`: {}", root, e))?;
    Ok(())
}
