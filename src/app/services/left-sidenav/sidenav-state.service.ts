import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SidenavStateService {
  open = signal(false);

  toggle() {
    this.open.set(!this.open());
  }
}
