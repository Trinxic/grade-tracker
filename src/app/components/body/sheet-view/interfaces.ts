export interface Assessment {
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
