import { TestBed } from '@angular/core/testing';

import { GradeUtilsService } from './grade-utils.service';

describe('GradeUtilsService', () => {
  let service: GradeUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GradeUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
