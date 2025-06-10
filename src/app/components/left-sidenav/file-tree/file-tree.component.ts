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
import { Component, computed, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";

// Angular Material
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTreeModule } from "@angular/material/tree";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";

// Tauri
import { join, sep, homeDir } from "@tauri-apps/api/path";

/**
 * FileTreeComponent obtains the file structure of a given directory from the backend and displays it in an Angular Treeview.
 */
@Component({
  selector: "app-file-tree",
  imports: [
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
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

  @ViewChild(MatMenuTrigger) fileTreeMenuTrigger!: MatMenuTrigger;
  fileTreeMenuPosition = { x: "0px", y: "0px" };
  hasChild = (_: number, node: FileNode) =>
    !!node.children && node.children.length > 0;
  hasFile = (_: number, node: FileNode) => !!node.isDirectory;
  dropListIds: string[] = [];

  constructor(
    private fileTreeService: FileTreeService,
    private gradeBooksService: GradeBooksService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    const semestersPath: string = await this.getRoot();
    await this.fileTreeService.setFileTree(semestersPath);
  }

  async getRoot(): Promise<string> {
    const home: string = await homeDir();
    const semestersPath: string = await join(
      home,
      this.baseDir,
      this.semestersDir,
    );
    return semestersPath;
  }

  /* --- Drag and Drop Events --- */
  dropListId(node: FileNode): string {
    return `dl-${node.stem.replace(/\s+/g, "_")}`;
  }

  async onDrop(event: CdkDragDrop<FileNode[]>): Promise<void> {
    if (event.previousContainer === event.container) return;

    const node: FileNode = event.item.data as FileNode;

    event.previousContainer.data.splice(event.previousIndex, 1);
    event.container.data.splice(event.currentIndex, 0, node);
  }

  /* --- Click Events --- */
  backgroundRightClick(event: MouseEvent): void {
    event.preventDefault();
    this.fileTreeMenuPosition.x = `${event.clientX}px`;
    this.fileTreeMenuPosition.y = `${event.clientY}px`;
    this.fileTreeMenuTrigger.openMenu();
  }

  async onNodeClick(file: FileNode): Promise<void> {
    if (file.isDirectory) return;
    const route = await this.gradeBooksService.load(file.path);
    this.router.navigate(route);
  }

  /* --- Creation --- */
  newFolder(): void {
    console.log("New folder action triggered");
    // TODO: Implement new folder creation logic
  }

  newFile(): void {
    console.log("New file action triggered");
    // TODO: Implement new file creation logic
  }
}
