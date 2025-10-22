import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveWorkoutComponent } from './active-workout.component';

describe('ActiveWorkoutComponent', () => {
  let component: ActiveWorkoutComponent;
  let fixture: ComponentFixture<ActiveWorkoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveWorkoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveWorkoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
