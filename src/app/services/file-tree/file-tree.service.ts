import { computed, Injectable, signal } from "@angular/core";
import { join, homeDir } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";

/**
 * FileNode represents a node in the file tree.
 */
export interface FileNode {
  path: string;
  stem: string;
  isDirectory: boolean;
  children?: FileNode[];
}

/**
 * ...
 */
@Injectable({
  providedIn: "root",
})
export class FileTreeService {
  baseDir: string = "Documents";
  semestersDir: string = "Semesters";

  fileTree = signal<FileNode[]>([]);
  returnWithRootNode = signal(false);

  // Add effects here
  constructor() {}

  /**
   * Obtains the file structure from the backend and formats it as a FileNode object.
   */
  async setFileTree(rootPath: string): Promise<void> {
    try {
      const fileTree = await invoke<FileNode>("get_file_tree", {
        root: rootPath,
      });
      if (this.returnWithRootNode()) {
        this.fileTree.set([fileTree]);
      } else {
        this.fileTree.set(fileTree.children || []);
      }
    } catch (error) {
      console.error("Error fetching file tree: ", error);
      this.fileTree.set([]);
    }
  }
}
