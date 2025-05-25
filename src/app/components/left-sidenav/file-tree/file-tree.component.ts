// Personal
import type { FileNode } from "@services/file-tree/file-tree.service";
import { FileTreeService } from "@services/file-tree/file-tree.service";
import { GradeBooksService } from "@services/grade-books/grade-books.service";

// Angular (General)
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

// Angular Material
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTreeModule } from "@angular/material/tree";

// Tauri
import { join, homeDir } from "@tauri-apps/api/path";

/**
 * FileTreeComponent obtains the file structure of a given directory from the backend and displays it in an Angular Treeview.
 */
@Component({
  selector: "app-file-tree",
  imports: [
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    CdkDropList,
    CdkDrag,
    CommonModule,
  ],
  templateUrl: "./file-tree.component.html",
  styleUrl: "./file-tree.component.css",
})
export class FileTreeComponent implements OnInit {
  baseDir: string = "Documents";
  semestersDir: string = "Semesters";

  dataSource = this.fileTreeService.fileTree;
  childrenAccessor = (node: FileNode) => node.children ?? [];
  hasChild = (_: number, node: FileNode) =>
    !!node.children && node.children.length > 0;

  constructor(
    private fileTreeService: FileTreeService,
    private gradeBooksService: GradeBooksService,
  ) {}

  async getRoot(): Promise<string> {
    const home: string = await homeDir();
    const semestersPath: string = await join(
      home,
      this.baseDir,
      this.semestersDir,
    );
    return semestersPath;
  }

  async ngOnInit(): Promise<void> {
    const semestersPath: string = await this.getRoot();
    await this.fileTreeService.setFileTree(semestersPath);
  }

  async onNodeClick(file: FileNode): Promise<void> {
    if (file.isDirectory) return;
    this.gradeBooksService.load(file.path);
  }

  drop(event: CdkDragDrop<FileNode[]>): void {
    if (event.container === event.previousContainer) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
