import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardSettingsPageComponent } from './board-settings-page.component';

describe('BoardSettingsPageComponent', () => {
  let component: BoardSettingsPageComponent;
  let fixture: ComponentFixture<BoardSettingsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BoardSettingsPageComponent]
    });
    fixture = TestBed.createComponent(BoardSettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
