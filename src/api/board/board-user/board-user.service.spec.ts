import { TestBed } from '@angular/core/testing';

import { BoardUserService } from './board-user.service';

describe('BoardUserService', () => {
  let service: BoardUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
