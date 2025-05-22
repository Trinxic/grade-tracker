import { MediaMatcher } from "@angular/cdk/layout";
import { Component, OnDestroy, inject, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { RouterLink, RouterOutlet } from "@angular/router";
import { MatTooltipModule } from "@angular/material/tooltip";

/** @title Responsive sidenav */
@Component({
  selector: "app-left-sidenav",
  imports: [
    MatToolbarModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
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

  constructor() {
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

  openSettings() {}
}
