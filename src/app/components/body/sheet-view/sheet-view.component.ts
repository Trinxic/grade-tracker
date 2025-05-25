// Personal imports
import type { Assessment, GradeBook } from "./interfaces";
import { GradeBookHistoryService } from "@services/grade-books/grade-book-history.service";
import { GradeBooksService } from "@services/grade-books/grade-books.service";
import {
  getContribution,
  getLetterGrade,
  getTotalContribution,
  getTotalWeight,
} from "@services/grade-books/grade-utils.service";

// Angular imports
import { FormsModule } from "@angular/forms";
import { CommonModule, NgFor, PercentPipe } from "@angular/common";
import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  ViewChild,
  QueryList,
} from "@angular/core";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from "@angular/cdk/drag-drop";

// Angular Material
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableModule, MatTable } from "@angular/material/table";

@Component({
  selector: "app-sheet-view",
  imports: [
    CommonModule,
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    NgFor,
    PercentPipe,
  ],
  templateUrl: "./sheet-view.component.html",
  styleUrls: ["./sheet-view.component.css"],
})
export class SheetViewComponent implements OnInit, OnDestroy {
  semesterName = "grade-books";

  // Signal Streams
  gradeBooks = this.gradeBooksService.gradeBooks;
  isSaved = this.gradeBooksService.isSaved;

  displayedColumns: string[] = [
    "icon",
    "assessment",
    "grade",
    "weight",
    "contribution",
  ];

  @ViewChild(MatTable) tables!: QueryList<MatTable<Assessment>>;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  // Context-menu state
  contextMenuPosition = { x: "0px", y: "0px" };
  contextMenuRow!: Assessment;
  contextMenuAssessments!: Assessment[];
  contextMenuTable!: MatTable<Assessment>;

  // Expose utils to template
  getContribution = getContribution;
  getTotalWeight = getTotalWeight;
  getTotalContribution = getTotalContribution;
  getLetterGrade = getLetterGrade;

  constructor(
    private gradeBooksService: GradeBooksService,
    private historyService: GradeBookHistoryService,
    private snackBar: MatSnackBar,
  ) {}

  /**
   * Load initial data and initialze history
   */
  async ngOnInit(): Promise<void> {
    await this.gradeBooksService.load(this.semesterName);
    this.historyService.snapshot(this.gradeBooksService.gradeBooks());
  }

  /**
   * Auto-save on teardown if unsaved
   */
  ngOnDestroy(): void {
    if (!this.gradeBooksService.isSaved()) {
      this.gradeBooksService.save();
    }
  }

  /**
   * Drag and drop event handler
   * @param event - The drag and drop event
   * @param assessments - The list of assessments for current table
   * @param table - The table being updated
   */
  drop(
    event: CdkDragDrop<Assessment[]>,
    assessments: Assessment[],
    table: MatTable<Assessment>,
  ) {
    this.gradeBooksService.markUnsaved();
    this.historyService.snapshot(this.gradeBooksService.gradeBooks());
    moveItemInArray(assessments, event.previousIndex, event.currentIndex);
    table.renderRows();
  }

  undo(): void {
    this.historyService.undo();
  }

  redo(): void {
    this.historyService.redo();
  }

  /**
   * Save the current state of the grade books
   */
  onSave(): void {
    this.gradeBooksService.save();
  }

  interactiveSave(): void {
    this.onSave();
    this.snackBar.open("Saved successfully", "", { duration: 1000 });
  }

  /**
   * Handle keyboard shortcuts
   */
  @HostListener("window:keydown", ["$event"])
  handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const mod = event.ctrlKey || event.metaKey;

    if (mod && key === "z" && !event.shiftKey) {
      event.preventDefault();
      this.undo();
    } else if (mod && (key === "y" || (event.shiftKey && key === "z"))) {
      event.preventDefault();
      this.redo();
    } else if (mod && key === "s") {
      event.preventDefault();
      this.onSave();
    }
  }

  /**
   * Handle right-click context menu within table
   * @param event - The mouse event
   * @param row - The assessment row being clicked
   * @param assessments - The list of assessments for current table
   * @param table - The table being updated
   */
  onRowMenu(
    event: MouseEvent,
    row: Assessment,
    assessments: Assessment[],
    table: MatTable<Assessment>,
  ): void {
    event.preventDefault();
    this.contextMenuRow = row;
    this.contextMenuAssessments = assessments;
    this.contextMenuTable = table;
    this.contextMenuPosition.x = `${event.clientX}px`;
    this.contextMenuPosition.y = `${event.clientY}px`;
    this.menuTrigger.openMenu();
  }

  /**
   * Handle context menu actions
   * @param action - The action to perform (insertAbove, insertBelow, duplicate, delete)
   */
  manipulateRow(action: string): void {
    this.gradeBooksService.markUnsaved();
    this.historyService.snapshot(this.gradeBooksService.gradeBooks());
    const idx = this.contextMenuAssessments.indexOf(this.contextMenuRow);
    if (idx < 0) return;

    switch (action) {
      case "insertAbove":
        this.contextMenuAssessments.splice(idx, 0, {
          assessment: "",
          grade: 0,
          weight: 0,
        });
        break;
      case "insertBelow":
        this.contextMenuAssessments.splice(idx + 1, 0, {
          assessment: "",
          grade: 0,
          weight: 0,
        });
        break;
      case "duplicate":
        this.contextMenuAssessments.splice(idx + 1, 0, {
          ...this.contextMenuRow,
        });
        break;
      case "delete":
        this.contextMenuAssessments.splice(idx, 1);
        break;
    }
    this.contextMenuTable.renderRows();
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
  ): void {
    this.editingCell = {
      bookIndex,
      row,
      field,
      originalValue: row[field],
      currentValue: row[field],
    };
  }

  finishEdit(): void {
    if (!this.editingCell) return;
    this.gradeBooksService.markUnsaved();
    this.historyService.snapshot(this.gradeBooksService.gradeBooks());

    const { row, field, currentValue } = this.editingCell;
    if (field === "grade" || field === "weight") {
      row[field] = parseFloat(currentValue as string) || 0;
    } else {
      row[field] = currentValue as string;
    }
    this.editingCell = null;
  }

  cancelEdit(): void {
    this.editingCell = null;
  }

  isEditing(
    bookIndex: number,
    row: Assessment,
    field: "assessment" | "grade" | "weight",
  ): boolean {
    return (
      this.editingCell?.bookIndex === bookIndex &&
      this.editingCell?.row === row &&
      this.editingCell?.field === field
    );
  }
}
