import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBoardPageComponent } from './new-board-page.component';

describe('NewBoardPageComponent', () => {
  let component: NewBoardPageComponent;
  let fixture: ComponentFixture<NewBoardPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewBoardPageComponent]
    });
    fixture = TestBed.createComponent(NewBoardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
