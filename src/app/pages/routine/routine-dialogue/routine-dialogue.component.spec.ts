import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutineDialogueComponent } from './routine-dialogue.component';

describe('RoutineDialogueComponent', () => {
  let component: RoutineDialogueComponent;
  let fixture: ComponentFixture<RoutineDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutineDialogueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoutineDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
