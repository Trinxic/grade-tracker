import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTreeModule } from "@angular/material/tree";
import { join, homeDir } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";

/**
 * FileNode represents a node in the file tree.
 * `export`?
 */
interface FileNode {
  name: string;
  isDirectory: boolean;
  children?: FileNode[];
}

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
  ],
  templateUrl: "./file-tree.component.html",
  styleUrl: "./file-tree.component.css",
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileTreeComponent implements OnInit {
  // semestersBaseDir: BaseDirectory = BaseDirectory.Document;
  baseDir: string = "Documents";
  semestersDir: string = "Semesters";

  dataSource: FileNode[] = [];
  childrenAccessor = (node: FileNode) => node.children ?? [];
  hasChild = (_: number, node: FileNode) =>
    !!node.children && node.children.length > 0;

  async ngOnInit(): Promise<void> {
    // const dirExists = await exists(this.semestersDir, {
    //   baseDir: this.semestersBaseDir,
    // });
    // if (!dirExists) {
    //   mkdir(this.semestersDir, { baseDir: this.semestersBaseDir });
    // }
    const home: string = await homeDir();
    const semestersPath: string = await join(
      home,
      this.baseDir,
      this.semestersDir,
    );
    this.dataSource = await this.getFileTree(semestersPath);
  }

  /**
   * Obtain the file structure from the backend and formats it as a FileNode object.
   */
  private async getFileTree(path: string): Promise<FileNode[]> {
    try {
      const fileTree = await invoke<FileNode>("get_file_tree", {
        root: path,
      });
      return [fileTree];
      // return fileTree.children || [];
    } catch (error) {
      console.error("Error fetching file tree: ", error);
      return [];
    }
  }

  // async openSettings(): Promise<void> {
  //   const home: string = await homeDir();
  //   const semestersPath: string = await join(
  //     home,
  //     this.baseDir,
  //     this.semestersDir,
  //   );
  //   this.dataSource = await this.getFileTree(semestersPath);
  // }

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

    // TODO: Call backend to update the file structure
  }
}
