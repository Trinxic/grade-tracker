import { Injectable, signal, effect } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import { homeDir, join } from "@tauri-apps/api/path";
import type { GradeBook } from "@components/body/sheet-view/interfaces";
import { message } from "@tauri-apps/plugin-dialog";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class GradeBooksService {
  gradeBooks = signal<GradeBook[]>([]);
  isSaved = signal(true);
  private autoSaveDelay!: ReturnType<typeof setTimeout>;

  constructor(private router: Router) {
    effect(() => {
      if (!this.isSaved()) {
        clearTimeout(this.autoSaveDelay);
        this.autoSaveDelay = setTimeout(() => this.save(), 15000);
      }
    });
  }

  async load(relFilePath: string): Promise<string[]> {
    const home = await homeDir();
    const filePath = await join(home, "Documents", `${relFilePath}`);
    try {
      const data = await invoke<GradeBook[]>("get_courses", {
        root: filePath,
      });
      this.gradeBooks.set(data);
      this.isSaved.set(true);
      return ["/sheet-view"];
    } catch (err) {
      return ["/file-error"];
    }
  }

  markUnsaved(): void {
    this.isSaved.set(false);
  }

  async save(): Promise<void> {
    if (this.isSaved()) return;
    const home = await homeDir();
    const filePath = await join(
      home,
      "Documents",
      "Semesters",
      "grade-books.json",
    );
    await invoke("write_semester_json", {
      root: filePath,
      gradeBooks: this.gradeBooks(),
    });
    this.isSaved.set(true);
  }
}
