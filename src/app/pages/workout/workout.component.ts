import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, Observable, of, startWith, switchMap } from 'rxjs';
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
  newSet: { reps?: number; weight?: number }; // for inline input
}

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.scss']
})
export class WorkoutComponent implements OnInit {
  private base = 'http://localhost:8000';

  workout: Workout | null = null;
  workoutExercises: WorkoutExercise[] = [];

  showExerciseSearch = false;

  exerciseSearchControl = new FormControl('');
  filteredExercises$: Observable<Exercise[]> = of([]);

  constructor(private http: HttpClient, private exerciseService: ExerciseService) {}

  ngOnInit(): void {
    this.loadActiveWorkout();

    // Setup filtered exercise dropdown
    this.filteredExercises$ = this.exerciseSearchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      switchMap(value => this.searchExercises(value || ''))
    );
  }

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

  toggleExerciseSearch() {
  this.showExerciseSearch = !this.showExerciseSearch;
  if (!this.showExerciseSearch) {
    this.exerciseSearchControl.setValue('');
  }
  }

  searchExercises(query: string): Observable<Exercise[]> {
    if (!query.trim()) return of([]);
    return this.exerciseService.listExercises(query);
  }

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

  addExercise(ex: Exercise) {
    if (!this.workout) return;
    this.exerciseService.addExerciseToWorkout(this.workout.workout_id, ex.id).subscribe({
      next: res => {
      this.workoutExercises.push({
        workout_exercise_id: res.workout_exercise_id,
        exercise_id: ex.id,
        name: ex.name,
        sets: [],
        newSet: { reps: undefined, weight: undefined } // initialize
      });
        this.exerciseSearchControl.setValue(''); // Clear search
      },
      error: (err) => console.error(err)
    });
  }

  removeExercise(ex: WorkoutExercise) {
    if (!this.workout) return;
    this.http.delete(`${this.base}/workouts/${this.workout.workout_id}/exercise/${ex.workout_exercise_id}`)
      .subscribe({
        next: () => {
          this.workoutExercises = this.workoutExercises.filter(e => e.workout_exercise_id !== ex.workout_exercise_id);
        },
        error: (err) => console.error('Error removing exercise:', err)
      });
  }

addSetInline(ex: WorkoutExercise) {
  if (!this.workout || !ex.newSet?.reps || !ex.newSet?.weight) return;

  const { reps, weight } = ex.newSet;

  this.http.post<any>(
    `${this.base}/workouts/${this.workout.workout_id}/exercise/${ex.workout_exercise_id}/sets?reps=${reps}&weight=${weight}`,
    {}
  ).subscribe({
    next: (res) => {
      // Append new set locally (no full refresh)
      const newSet: WorkoutSet = {
        id: res.id, // assuming backend returns id of created set
        reps,
        weight
      };
      ex.sets.push(newSet);
      ex.newSet = {}; // reset inputs
    },
    error: (err) => console.error('Error adding set:', err)
  });
}

removeSet(ex: WorkoutExercise, setId: number) {
  if (!this.workout) return;
  this.http.delete(`${this.base}/workouts/${this.workout.workout_id}/exercise/${ex.workout_exercise_id}/sets/${setId}`)
    .subscribe({
      next: () => {
        // Remove set locally (no refresh)
        ex.sets = ex.sets.filter(s => s.id !== setId);
      },
      error: (err) => console.error('Error removing set:', err)
    });
}

  refreshWorkout() {
    if (!this.workout) return;
    this.http.get<any>(`${this.base}/workouts/${this.workout.workout_id}`).subscribe({
      next: (res) => {
      this.workoutExercises = (res.exercises || []).map((e: any) => ({
        workout_exercise_id: e.id,
        exercise_id: e.exercise.id,
        name: e.exercise.name,
        sets: e.sets || [],
        newSet: { reps: undefined, weight: undefined } // initialize
      }));
      },
      error: (err) => console.error('Error refreshing workout:', err)
    });
  }

  completeWorkout() {
    if (!this.workout) return;
    this.http.post(`${this.base}/workouts/${this.workout.workout_id}/complete`, {}).subscribe({
      next: () => {
        alert('Workout completed!');
        this.workout = null;
        this.workoutExercises = [];
      },
      error: (err) => console.error('Error completing workout:', err)
    });
  }

  discardWorkout() {
    if (!this.workout) return;
    this.http.delete<any>(`${this.base}/workouts/${this.workout.workout_id}`).subscribe({
      next: () => {
        alert('Workout discarded.');
        this.workout = null;
        this.workoutExercises = [];
      },
      error: (err) => console.error(err)
    });
  }
}
