import { TestBed } from '@angular/core/testing';

import { GradeBookHistoryService } from './grade-book-history.service';

describe('GradeBookHistoryService', () => {
  let service: GradeBookHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GradeBookHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
