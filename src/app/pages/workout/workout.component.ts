import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { Exercise, ExerciseService } from '../../core/services/exercise.service';

interface Workout {
  workout_id: number;
  status: string;
}

interface WorkoutSet {
  id: number;
  reps: number;
  weight: number;
}

interface WorkoutExercise {
  workout_exercise_id: number;
  exercise_id: number;
  name: string;
  sets: WorkoutSet[];
}

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.scss']
})
export class WorkoutComponent implements OnInit {
  private base = 'http://localhost:8000';

  workout: Workout | null = null;
  exercises: Exercise[] = [];
  workoutExercises: WorkoutExercise[] = [];
  searchQuery = '';

  constructor(private http: HttpClient,private exerciseService: ExerciseService) {}

  ngOnInit(): void {
    this.loadActiveWorkout();
  }

  // ✅ Check if user already has an active workout
  loadActiveWorkout() {
    this.http.get<any>(`${this.base}/workouts/active`).subscribe({
      next: (res) => {
        if (res.active) {
          this.workout = { workout_id: res.workout_id, status: res.status };
          this.workoutExercises = res.exercises || [];
        } else {
          this.workout = null;
        }
      },
      error: (err) => console.error('Failed to load active workout:', err)
    });
  }

  // ✅ Start a workout only if none active
  startWorkout() {
    this.http.post<any>(`${this.base}/workouts`, {}).subscribe({
      next: (res) => {
        this.workout = { workout_id: res.workout_id, status: res.status };
        this.workoutExercises = [];
      },
      error: (err) => {
        if (err.status === 400 && err.error.detail === 'You already have an active workout') {
          this.loadActiveWorkout();
        } else {
          console.error('Error starting workout:', err);
        }
      }
    });
  }

  // ✅ Get list of exercises (searchable)
  listExercises(q: string = ''): void {
    this.http.get<Exercise[]>(`${this.base}/exercises?q=${q}`).subscribe({
      next: (res) => this.exercises = res,
      error: (err) => console.error('Error fetching exercises:', err)
    });
  }

  // ✅ Add exercise to workout
addExercise(ex: Exercise) {
  if (!this.workout) {
    console.error("No active workout found");
    return;
  }
  
  // Call backend to add exercise
  this.exerciseService
    .addExerciseToWorkout(this.workout.workout_id, ex.id)
    .subscribe({
      next: (res: { workout_exercise_id: number }) => {
        this.workoutExercises.push({
          workout_exercise_id: res.workout_exercise_id,
          exercise_id: ex.id,
          name: ex.name,
          sets: []
        });
      },
      error: (err) => console.error("Error adding exercise:", err)
    });
}

  // ✅ Fetch workout details (includes exercises + sets)
  refreshWorkout(): void {
    if (!this.workout) return;
    this.http.get<any>(`${this.base}/workouts/${this.workout.workout_id}`).subscribe({
      next: (res) => {
        // Normalize exercises/sets for frontend
        this.workoutExercises = (res.exercises || []).map((e: any) => ({
          workout_exercise_id: e.id,
          exercise_id: e.exercise.id,
          name: e.exercise.name,
          sets: e.sets || []
        }));
      },
      error: (err) => console.error('Error refreshing workout:', err)
    });
  }

  // ✅ Add set to exercise
  addSet(ex: WorkoutExercise): void {
    if (!this.workout) return;

    const reps = prompt('Enter reps:');
    const weight = prompt('Enter weight:');
    if (!reps || !weight) return;

    this.http.post(
      `${this.base}/workouts/${this.workout.workout_id}/exercise/${ex.workout_exercise_id}/sets?reps=${reps}&weight=${weight}`,
      {}
    ).subscribe({
      next: () => this.refreshWorkout(),
      error: (err) => console.error('Error adding set:', err)
    });
  }

  // ✅ Remove set from exercise
  removeSet(ex: WorkoutExercise, setId: number): void {
    if (!this.workout) return;

    this.http.delete(
      `${this.base}/workouts/${this.workout.workout_id}/exercise/${ex.workout_exercise_id}/sets/${setId}`
    ).subscribe({
      next: () => this.refreshWorkout(),
      error: (err) => console.error('Error removing set:', err)
    });
  }

  // ✅ Complete workout
  completeWorkout(): void {
    if (!this.workout) return;

    this.http.post(`${this.base}/workouts/${this.workout.workout_id}/complete`, {}).subscribe({
      next: () => {
        alert('Workout completed successfully!');
        this.workout = null;
        this.workoutExercises = [];
      },
      error: (err) => console.error('Error completing workout:', err)
    });
  }

  discardWorkout() {
    if (!this.workout) return;
    this.http
      .delete<any>(`${this.base}/workouts/${this.workout.workout_id}`)
      .subscribe({
        next: () => {
          alert('Workout discarded.');
          this.workout = null;
          this.workoutExercises = [];
        },
        error: (err) => console.error(err)
      });
  }
}

