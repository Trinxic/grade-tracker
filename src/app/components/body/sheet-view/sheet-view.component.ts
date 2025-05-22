import { Component, ViewChild, QueryList, OnInit } from "@angular/core";
import { MatTable, MatTableModule } from "@angular/material/table";
import { CommonModule, NgFor, PercentPipe } from "@angular/common";
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { MatIconModule } from "@angular/material/icon";
import gradeBooks from "./grade-books.json";
import { invoke } from "@tauri-apps/api/core";
import { MCMASTER_LETTER_GRADES } from "./grade-scales";
import { homeDir, join } from "@tauri-apps/api/path";
import { FormsModule } from "@angular/forms";

export interface Assessment {
  index: number;
  assessment: string;
  grade: number;
  weight: number;
  contribution?: number;
}

export interface GradeBook {
  index: number;
  courseName: string;
  assessments: Assessment[];
}

/**
 * @title Gradebook Table
 * The Gradebook Table component displays a list of assessments with their grades and weights.
 * The contribution of each assessment is calculated based on its grade and weight.
 * The table allows for drag-and-drop reordering of assessments as well as editing assessment names, grades and weights.
 */
@Component({
  selector: "app-sheet-view",
  imports: [
    CdkDropList,
    CdkDrag,
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    NgFor,
    PercentPipe,
  ],
  templateUrl: "./sheet-view.component.html",
  styleUrl: "./sheet-view.component.css",
})
export class SheetViewComponent implements OnInit {
  courseName = "Test Course";
  displayedColumns: string[] = [
    "icon",
    "assessment",
    "grade",
    "weight",
    "contribution",
  ];
  gradeBooks: GradeBook[] = [];

  @ViewChild(MatTable) table!: QueryList<MatTable<Assessment>>;

  async ngOnInit(): Promise<void> {
    const home: string = await homeDir();
    const semestersPath: string = await join(
      home,
      "Documents",
      "Semesters",
      "grade-books.json",
    );
    this.gradeBooks = await this.getGradeBooks(semestersPath);
  }

  protected async getGradeBooks(path: string): Promise<GradeBook[]> {
    try {
      const books = await invoke<GradeBook[]>("get_courses", {
        root: path,
      });
      return books;
    } catch (error) {
      console.error("Error fetching grade books: ", error);
      return [];
    }
  }

  drop(
    event: CdkDragDrop<string>,
    gradeBook: Assessment[],
    table: MatTable<Assessment>,
  ) {
    const previousIndex = gradeBook.findIndex((d) => d === event.item.data);
    moveItemInArray(gradeBook, previousIndex, event.currentIndex);
    table.renderRows();
  }

  /* --- Populating Table Cells --- */
  protected getContribution(a: Assessment) {
    const grade = a.grade ?? 0;
    const weight = a.weight ?? 0;
    return Math.round(grade * weight * 100) / 100;
  }

  protected getTotalWeight(gradeBook: Assessment[]) {
    return gradeBook
      .map((d) => d.weight)
      .reduce((acc, value) => acc + value, 0);
  }

  protected getTotalContribution(gradeBook: Assessment[]) {
    return gradeBook.reduce((sum, d) => sum + this.getContribution(d), 0);
  }

  protected getLetterGrade(gradeBook: Assessment[]) {
    const totalContribution = this.getTotalContribution(gradeBook);
    const totalWeight = this.getTotalWeight(gradeBook);

    if (totalWeight === 0) {
      return "N/A";
    }

    const percentage = Math.round(totalContribution / totalWeight);

    for (const grade of MCMASTER_LETTER_GRADES) {
      if (percentage >= grade.min) {
        return grade.letter;
      }
    }
    return "N/A";
  }

  /* --- Editing Cells --- */
  editingCell: {
    bookIndex: number;
    row: Assessment;
    field: "assessment" | "grade" | "weight";
    originalValue: string | number;
    currentValue: string | number;
  } | null = null;

  startEdit(
    bookIndex: number,
    row: Assessment,
    field: "assessment" | "grade" | "weight",
  ) {
    this.editingCell = {
      bookIndex,
      row,
      field,
      originalValue: row[field],
      currentValue: row[field],
    };
  }

  finishEdit() {
    if (!this.editingCell) return;
    const { row, field, currentValue } = this.editingCell;

    if (field === "grade" || field === "weight") {
      row[field] = parseFloat(currentValue as string) || 0;
    } else {
      row[field] = currentValue as string;
    }

    this.editingCell = null;
  }

  cancelEdit() {
    this.editingCell = null;
  }

  isEditing(
    bookIndex: number,
    row: Assessment,
    field: "assessment" | "grade" | "weight",
  ) {
    return (
      this.editingCell?.bookIndex === bookIndex &&
      this.editingCell?.row === row &&
      this.editingCell?.field === field
    );
  }
}
