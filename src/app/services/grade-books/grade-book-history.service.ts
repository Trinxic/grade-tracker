import { Injectable } from "@angular/core";
import { GradeBook } from "../../components/body/sheet-view/interfaces";

@Injectable({
  providedIn: "root",
})
export class GradeBookHistoryService {
  private history: GradeBook[][] = [];
  private index: number = -1;
  private maxHistorySize: number = 50;

  snapshot(state: GradeBook[]): void {
    this.history.splice(this.index + 1);
    this.history.push(structuredClone(state));
    this.index = this.history.length - 1;
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.index--;
    }
  }

  canUndo(numUndos: number = 1): boolean {
    return this.index >= numUndos;
  }
  canRedo(numRedos: number = 1): boolean {
    return this.index < this.history.length - 1 - numRedos;
  }

  undo(numUndos: number = 1): GradeBook[] | null {
    if (!this.canUndo(numUndos)) return null;
    this.index -= numUndos;
    return structuredClone(this.history[this.index]);
  }
  redo(numRedos: number = 1): GradeBook[] | null {
    if (!this.canRedo(numRedos)) return null;
    this.index += numRedos;
    return structuredClone(this.history[this.index]);
  }
}
