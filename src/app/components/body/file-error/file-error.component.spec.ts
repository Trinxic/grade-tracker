import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileErrorComponent } from './file-error.component';

describe('FileErrorComponent', () => {
  let component: FileErrorComponent;
  let fixture: ComponentFixture<FileErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
