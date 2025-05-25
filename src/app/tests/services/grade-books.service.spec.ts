import { TestBed } from '@angular/core/testing';

import { GradeBooksService } from './grade-books.service';

describe('GradeBooksService', () => {
  let service: GradeBooksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GradeBooksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
