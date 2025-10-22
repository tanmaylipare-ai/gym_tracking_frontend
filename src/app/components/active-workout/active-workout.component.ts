import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-active-workout',
  standalone: true,
  imports: [MatButtonModule, CommonModule],
  templateUrl: './active-workout.component.html',
  styleUrl: './active-workout.component.css'
})

export class ActiveWorkoutComponent {
  @Input() minimized = false;
  @Output() minimize = new EventEmitter<void>();
}
