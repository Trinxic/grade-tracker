import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTreeModule } from "@angular/material/tree";
// import { exists, mkdir, BaseDirectory } from "@tauri-apps/plugin-fs";
import { join, homeDir } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";

/**
 * FileNode represents a node in the file tree.
 */
export interface FileNode {
  name: string;
  isDirectory: boolean;
  children?: FileNode[];
}

/**
 * FileTreeComponent obtains the file structure of a given directory from the backend and displays it in an Angular Treeview.
 */
@Component({
  selector: "app-file-tree",
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
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
      const fileTree = await invoke<FileNode[]>("get_file_tree", {
        root: path,
      });
      console.error("File tree: ", fileTree);
      return fileTree;
    } catch (error) {
      console.error("Error fetching file tree: ", error);
      return [];
    }
  }

  // private async changeSemestersDir(newDir: string): Promise<void> {
  //   // Check if the new directory exists
  //   // ...
  //   const docDirPath: string = await documentDir();
  //   const semestersPath: string = await join(docDirPath, newDir);
  //   this.dataSource = await this.getFileTree(semestersPath);
  // }
}
// private async loadDirectories(dirPath: string): Promise<FileNode[]> {
//   const entries: DirEntry[] = await readDir(dirPath, {
//     baseDir: this.semestersBaseDir,
//   });
//
//   const nodes: FileNode[] = [];
//   for (const entry of entries) {
//     if (entry.name === ".DS_Store") {
//       continue; // Skip .DS_Store files
//     }
//
//     const node: FileNode = {
//       name: entry.name,
//       isDirectory: entry.isDirectory,
//       children: [],
//     };
//     if (entry.isDirectory) {
//       const entryPath = await join(dirPath, entry.name!);
//       node.children = await this.loadDirectories(entryPath);
//     }
//     nodes.push(node);
//   }
//   return nodes;
// }

/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

// interface FoodNode {
//   name: string;
//   children?: FoodNode[];
// }
const EXAMPLE_DATA: FileNode[] = [
  {
    name: "Fruit",
    isDirectory: true,
    children: [
      { name: "Apple", isDirectory: false },
      { name: "Banana", isDirectory: false },
      { name: "Fruit loops", isDirectory: false },
    ],
  },
  {
    name: "Vegetables",
    isDirectory: true,
    children: [
      {
        name: "Green",
        isDirectory: true,
        children: [
          { name: "Broccoli", isDirectory: false },
          { name: "Brussels sprouts", isDirectory: false },
        ],
      },
      {
        name: "Orange",
        isDirectory: true,
        children: [
          { name: "Pumpkins", isDirectory: false },
          { name: "Carrots", isDirectory: false },
        ],
      },
    ],
  },
];
