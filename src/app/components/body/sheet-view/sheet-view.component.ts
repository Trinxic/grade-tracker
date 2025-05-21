import { Component, ViewChild } from "@angular/core";
import { MatTable, MatTableModule } from "@angular/material/table";
import { PercentPipe } from "@angular/common";
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { MatIconModule } from "@angular/material/icon";

export interface Assessment {
  assessment: string;
  grade: number;
  weight: number;
  contribution?: number;
}

/**
 * @title Gradebook Table
 * The Gradebook Table component displays a list of assessments with their grades and weights.
 * The contribution of each assessment is calculated based on its grade and weight.
 * The table allows for drag-and-drop reordering of assessments as well as editing assessment names, grades and weights.
 */
@Component({
  selector: "app-sheet-view",
  imports: [CdkDropList, CdkDrag, MatTableModule, MatIconModule, PercentPipe],
  templateUrl: "./sheet-view.component.html",
  styleUrl: "./sheet-view.component.css",
})
export class SheetViewComponent {
  fileName = "Test Semester";

  @ViewChild("table", { static: true }) table!: MatTable<Assessment>;

  displayedColumns: string[] = [
    "assessment",
    "grade",
    "weight",
    "contribution",
  ];
  gradeBook: Assessment[] = ELEMENT_DATA;

  drop(event: CdkDragDrop<string>) {
    const previousIndex = this.gradeBook.findIndex(
      (d) => d === event.item.data,
    );
    moveItemInArray(this.gradeBook, previousIndex, event.currentIndex);
    this.table.renderRows();
  }

  getContribution(a: Assessment) {
    const grade = a.grade ?? 0;
    const weight = a.weight ?? 0;
    return Math.round(grade * weight * 100) / 100;
  }

  getTotalWeight() {
    return this.gradeBook
      .map((d) => d.weight)
      .reduce((acc, value) => acc + value, 0);
  }

  getTotalContribution() {
    return this.gradeBook.reduce((sum, d) => sum + this.getContribution(d), 0);
  }

  getLetterGrade() {
    const totalContribution = this.getTotalContribution();
    const totalWeight = this.getTotalWeight();

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
}

export const MCMASTER_LETTER_GRADES = [
  { letter: "A+", min: 90 },
  { letter: "A", min: 85 },
  { letter: "A-", min: 80 },
  { letter: "B+", min: 77 },
  { letter: "B", min: 73 },
  { letter: "B-", min: 70 },
  { letter: "C+", min: 67 },
  { letter: "C", min: 63 },
  { letter: "C-", min: 60 },
  { letter: "D+", min: 57 },
  { letter: "D", min: 53 },
  { letter: "D-", min: 50 },
  { letter: "F", min: 0 },
];

export const ELEMENT_DATA: Assessment[] = [
  {
    assessment: "Assignment 1",
    grade: 85,
    weight: 0.2,
  },
  {
    assessment: "Assignment 2",
    grade: 90,
    weight: 0.15,
  },
  {
    assessment: "Midterm Exam",
    grade: 78,
    weight: 0.25,
  },
  {
    assessment: "Final Exam",
    grade: 92,
    weight: 0.3,
  },
];
