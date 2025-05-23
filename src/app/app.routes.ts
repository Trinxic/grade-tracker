import { Routes } from "@angular/router";
import { HomeComponent } from "./components/body/home/home.component";
import { SettingsComponent } from "./components/body/settings/settings.component";
import { SheetViewComponent } from "./components/body/sheet-view/sheet-view.component";
import { BookmarkedFilesComponent } from "./components/left-sidenav/bookmarked-files/bookmarked-files.component";
import { FileTreeComponent } from "./components/left-sidenav/file-tree/file-tree.component";
import { SearchFilesComponent } from "./components/left-sidenav/search-files/search-files.component";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "sheet-view",
    pathMatch: "full",
  },
  {
    path: "home",
    component: HomeComponent,
  },
  {
    path: "settings",
    component: SettingsComponent,
  },
  {
    path: "sheet-view",
    component: SheetViewComponent,
  },
  {
    path: "search-files",
    component: SearchFilesComponent,
    outlet: "sidenav",
  },
  {
    path: "bookmarked",
    component: BookmarkedFilesComponent,
    outlet: "sidenav",
  },
  {
    path: "file-tree",
    component: FileTreeComponent,
    outlet: "sidenav",
  },
];
