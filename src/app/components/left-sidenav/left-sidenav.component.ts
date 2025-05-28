// Personal
import { FileTreeService } from "@services/file-tree/file-tree.service";
// Angular (General)
import { Component, OnDestroy, ViewChild, inject, signal } from "@angular/core";
import { MediaMatcher } from "@angular/cdk/layout";
import { RouterLink, RouterOutlet } from "@angular/router";
import { Router } from "@angular/router";
// Angular Material
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
// Tauri
import { open } from "@tauri-apps/plugin-dialog";

/** @title Responsive sidenav */
@Component({
  selector: "app-left-sidenav",
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    RouterLink,
    RouterOutlet,
  ],
  templateUrl: "./left-sidenav.component.html",
  styleUrl: "./left-sidenav.component.css",
})
export class LeftSidenavComponent implements OnDestroy {
  protected readonly isMobile = signal(true);

  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;

  @ViewChild(MatMenuTrigger) folderMenuTrigger!: MatMenuTrigger;
  folderMenuPosition = { x: "0px", y: "0px" };

  constructor(
    private router: Router,
    private fileTree: FileTreeService,
  ) {
    const media = inject(MediaMatcher);

    this._mobileQuery = media.matchMedia("(max-width: 600px)");
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () =>
      this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener("change", this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener("change", this._mobileQueryListener);
  }

  onFolderClick(event: MouseEvent, side: "left" | "right") {
    event.preventDefault();
    event.stopImmediatePropagation();
    switch (side) {
      case "left":
        this.router.navigate([{ outlets: { sidenav: ["file-tree"] } }]);
        break;
      case "right":
        this.folderMenuPosition.x = `${event.clientX}px`;
        this.folderMenuPosition.y = `${event.clientY}px`;
        this.folderMenuTrigger.openMenu();
        break;
      default:
        console.error("Invalid side specified for folder click:", side);
        return;
    }
  }

  async chooseFolder() {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select a folder",
    });
    const folder = Array.isArray(selected) ? selected[0] : selected;
    if (typeof folder === "string") {
      await this.fileTree.setFileTree(folder);
    }
  }
}
