// import { Injectable } from '@angular/core';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class GradeUtilsService {
//
//   constructor() { }
// }

import type {
  Assessment,
  GradeBook,
} from "../../components/body/sheet-view/interfaces";
import { MCMASTER_LETTER_GRADES } from "../../components/body/sheet-view/grade-scales";

export function getContribution(a: Assessment): number {
  return Math.round((a.grade ?? 0) * (a.weight ?? 0) * 100) / 100;
}

export function getTotalWeight(assessments: Assessment[]): number {
  return assessments.reduce(
    (sum, assessment) => sum + (assessment.weight ?? 0),
    0,
  );
}

export function getTotalContribution(assessments: Assessment[]): number {
  return assessments.reduce((sum, a) => sum + getContribution(a), 0);
}

export function getLetterGrade(assessments: Assessment[]): string {
  const totalWeight = getTotalWeight(assessments);
  if (totalWeight === 0) return "N/A";
  const pct = Math.round(getTotalContribution(assessments) / totalWeight);
  return MCMASTER_LETTER_GRADES.find((g) => pct >= g.min)?.letter ?? "N/A";
}
