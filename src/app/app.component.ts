import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LeftSidenavComponent } from "./components/left-sidenav/left-sidenav.component";

@Component({
  selector: "app-root",
  imports: [CommonModule, LeftSidenavComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {}
