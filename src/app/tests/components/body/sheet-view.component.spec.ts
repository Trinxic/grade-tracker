import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetViewComponent } from './sheet-view.component';

describe('SheetViewComponent', () => {
  let component: SheetViewComponent;
  let fixture: ComponentFixture<SheetViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SheetViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SheetViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
