import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActiveWorkoutComponent } from '../../components/active-workout/active-workout.component';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../../components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, ActiveWorkoutComponent, MatButtonModule,HeaderComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})


export class HomeComponent {
  username = 'John Doe'; //---------------------Dev: Later bind to AuthService this is hard coded for now 
  activeWorkoutVisible = false;
  isWorkoutMinimized = false;

  startWorkout() {
    this.activeWorkoutVisible = true;
  }

  toggleWorkoutMinimize() {
    this.isWorkoutMinimized = !this.isWorkoutMinimized;
  }
}
