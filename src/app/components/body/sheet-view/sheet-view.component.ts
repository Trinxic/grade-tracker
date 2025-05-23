import {
  Component,
  OnInit,
  OnDestroy,
  QueryList,
  ViewChild,
} from "@angular/core";
import { MatTable, MatTableModule } from "@angular/material/table";
import { CommonModule, NgFor, PercentPipe } from "@angular/common";
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { MatIconModule } from "@angular/material/icon";
import { invoke } from "@tauri-apps/api/core";
import { MCMASTER_LETTER_GRADES } from "./grade-scales";
import { homeDir, join } from "@tauri-apps/api/path";
import { FormsModule } from "@angular/forms";
import { MatMenuModule } from "@angular/material/menu";
import { MatMenuTrigger } from "@angular/material/menu";
import { HostListener } from "@angular/core";
import { Assessment, GradeBook } from "./interfaces";
import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

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
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    NgFor,
    PercentPipe,
  ],
  templateUrl: "./sheet-view.component.html",
  styleUrl: "./sheet-view.component.css",
})
export class SheetViewComponent implements OnInit {
  courseName = "grade-books"; // TODO: Get from JSON file name
  displayedColumns: string[] = [
    "icon",
    "assessment",
    "grade",
    "weight",
    "contribution",
  ];
  gradeBooks: GradeBook[] = [];

  @ViewChild(MatTable) tables!: QueryList<MatTable<Assessment>>;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  async ngOnInit(): Promise<void> {
    const home: string = await homeDir();
    const semestersPath: string = await join(
      home,
      "Documents",
      "Semesters",
      this.courseName + ".json",
    );
    this.gradeBooks = await this.getGradeBooks(semestersPath);
    this.pushHistory();

    this.saveSubscription = this.saveTrigger
      .pipe(debounceTime(3000))
      .subscribe(() => this.doSave());
  }

  ngOnDestroy(): void {
    this.saveSubscription.unsubscribe();
    if (!this.isSaved) {
      this.doSave();
    }
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
    this.markUnsaved();
    this.pushHistory();
    const previousIndex = gradeBook.findIndex((d) => d === event.item.data);
    moveItemInArray(gradeBook, previousIndex, event.currentIndex);
    table.renderRows();
  }

  /* --- Saving Changes --- */
  isSaved = true;
  private saveTrigger = new Subject<void>();
  private saveSubscription!: Subscription;

  private markUnsaved() {
    this.isSaved = false;
    this.saveTrigger.next();
  }

  async doSave() {
    if (this.isSaved) return;
    try {
      const home: string = await homeDir();
      const semestersPath: string = await join(
        home,
        "Documents",
        "Semesters",
        this.courseName + ".json",
      );
      await invoke("write_semester_json", {
        root: semestersPath,
        gradeBooks: this.gradeBooks,
      });
      this.isSaved = true;
      console.log("Saved successfully");
    } catch (err) {
      console.error("Error saving grade books: ", err);
    }
  }

  /* --- History Management --- */
  private history: GradeBook[][] = [];
  private historyIndex = -1;
  private maxHistory = 50;

  private pushHistory() {
    this.history.splice(++this.historyIndex);

    const snapshot = structuredClone(this.gradeBooks);
    this.history.push(snapshot);

    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.gradeBooks = structuredClone(this.history[--this.historyIndex]);
    }
  }

  @HostListener("window:keydown", ["$event"])
  handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "z") {
      event.preventDefault();
      this.undo();
    }
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

  /* --- Context Menu --- */
  contextMenuPosition = { x: "0px", y: "0px" };
  contextMenuRow!: Assessment;
  contextMenuAssessments!: Assessment[];
  contextMenuTable!: MatTable<Assessment>;

  onRowMenu(
    event: MouseEvent,
    row: Assessment,
    assessments: Assessment[],
    table: MatTable<Assessment>,
  ) {
    event.preventDefault();
    this.contextMenuRow = row;
    this.contextMenuAssessments = assessments;
    this.contextMenuTable = table;
    this.contextMenuPosition.x = event.clientX + "px";
    this.contextMenuPosition.y = event.clientY + "px";
    this.menuTrigger.openMenu();
  }

  manipulateRow(action: string) {
    this.markUnsaved();
    this.pushHistory();
    const index = this.contextMenuAssessments.indexOf(this.contextMenuRow);
    if (index > -1) {
      switch (action) {
        case "insertAbove":
          this.contextMenuAssessments.splice(index, 0, {
            assessment: "New Assessment",
            grade: 0,
            weight: 0,
          });
          break;
        case "insertBelow":
          this.contextMenuAssessments.splice(index + 1, 0, {
            assessment: "New Assessment",
            grade: 0,
            weight: 0,
          });
          break;
        case "duplicate":
          const dupe = { ...this.contextMenuRow }; // shallow copy
          this.contextMenuAssessments.splice(index + 1, 0, dupe);
          break;
        case "delete":
          this.contextMenuAssessments.splice(index, 1);
          break;
      }
      this.contextMenuTable.renderRows();
    }
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
    this.markUnsaved();
    this.pushHistory();
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
