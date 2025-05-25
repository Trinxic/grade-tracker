import { GradeBooksService } from "@services/grade-books/grade-books.service";
import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-test",
  imports: [CommonModule],
  templateUrl: "./test.component.html",
  styleUrl: "./test.component.css",
})
export class TestComponent implements OnInit {
  constructor(private gradeBooksService: GradeBooksService) {}

  async ngOnInit(): Promise<void> {
    await this.gradeBooksService.load("grade-books");
  }

  onButtonClick(): void {
    console.log(this.gradeBooksService.gradeBooks());
  }
}
