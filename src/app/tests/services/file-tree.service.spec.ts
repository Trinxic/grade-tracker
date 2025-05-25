import { TestBed } from '@angular/core/testing';

import { FileTreeService } from '../../services/file-tree/file-tree.service';

describe('FileTreeService', () => {
  let service: FileTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
