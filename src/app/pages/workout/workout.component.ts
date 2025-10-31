import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, Observable, of, startWith, switchMap } from 'rxjs';
import { Exercise, GymService, SetEntry, Workout } from '../../core/services/gym_crud.service';
import { MatSnackBar } from '@angular/material/snack-bar';


interface WorkoutExercise {
  workout_exercise_id: number;
  exercise_id: number;
  name: string;
  sets: EditableSet[];
  newSet: { reps?: number; weight?: number };
}

interface EditableSet extends SetEntry {
  editing?: boolean;
  tempReps?: number | null;
  tempWeight?: number | null;
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
  styleUrls: ['./workout.component.css']
})
export class WorkoutComponent implements OnInit {
  workout: Workout | null = null;
  workoutExercises: WorkoutExercise[] = [];

  showSummary = false;
  summaryData: { totalVolume: number; totalSets: number; newPRs: string[] } | null = null;

  showExerciseSearch = false;
  exerciseSearchControl = new FormControl('');
  filteredExercises$: Observable<Exercise[]> = of([]);

  constructor(private gymService: GymService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadActiveWorkout();

    // live search setup
    this.filteredExercises$ = this.exerciseSearchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      switchMap(value => this.searchExercises(value || ''))
    );
  }

  // 🔹 toggle set edit 
    toggleEditSet(set: EditableSet) {
    set.editing = !set.editing;
    if (set.editing) {
      // preload with existing values
      set.tempReps = set.reps;
      set.tempWeight = set.weight;
    }else {
    // optional: clear temps when leaving edit mode
    set.tempReps = null;
    set.tempWeight = null;
  }
  }

  // ===========================
  // 🔹 Load Active Workout
  // ===========================
  loadActiveWorkout() {
    this.gymService.getActiveWorkout().subscribe({
      next: (res) => {
        if (res && res.workout_id) {
          this.workout = res;
          this.workoutExercises = (res.exercises || []).map((e: any) => ({
            workout_exercise_id: e.id,
            exercise_id: e.exercise.id,
            name: e.exercise.name,
            sets: e.sets || [],
            newSet: { reps: undefined, weight: undefined }
          }));
        } else {
          this.workout = null;
        }
      },
      error: (err) => console.error('Failed to load active workout:', err)
    });
  }

  // ===========================
  // 🔹 Exercise Search
  // ===========================
  toggleExerciseSearch() {
    this.showExerciseSearch = !this.showExerciseSearch;
    if (!this.showExerciseSearch) this.exerciseSearchControl.setValue('');
  }

  searchExercises(query: string): Observable<Exercise[]> {
    if (!query.trim()) return of([]);
    return this.gymService.listExercises(query);
  }

  // ===========================
  // 🔹 Start / Complete / Discard
  // ===========================
  startWorkout() {
    this.gymService.startWorkout().subscribe({
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

completeWorkout() {
  if (!this.workout) return;

  // Calculate summary data before sending completion
  const allSets = this.workoutExercises.flatMap(e => e.sets);
  const totalVolume = allSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const totalSets = allSets.length;

  // Optional: Determine new PRs
  // You can enhance this later by fetching previous max from backend.
  const newPRs: string[] = [];
  this.workoutExercises.forEach(ex => {
    if (ex.sets.length > 0) {
      const maxWeight = Math.max(...ex.sets.map(s => s.weight));
      const topSet = ex.sets.find(s => s.weight === maxWeight);
      if (topSet) {
        newPRs.push(`${ex.name}: ${topSet.weight} kg × ${topSet.reps} reps`);
      }
    }
  });

  this.gymService.completeWorkout(this.workout.workout_id).subscribe({
    next: () => {
      this.summaryData = { totalVolume, totalSets, newPRs };
      this.showSummary = true; // show popup
      // keep workoutExercises in memory to show summary
    },
    error: (err) => console.error('Error completing workout:', err)
  });
}

discardWorkout() {
  if (!this.workout) return;

  this.gymService.discardWorkout(this.workout.workout_id).subscribe({
    next: () => {
      // Clear data and reload the workout page state
      this.workout = null;
      this.workoutExercises = [];
    },
    error: (err) => console.error('Error discarding workout:', err)
  });
}

closeSummary() {
  this.showSummary = false;
  this.summaryData = null;
  // Reset to initial state (like discard)
  this.workout = null;
  this.workoutExercises = [];
}

  // ===========================
  // 🔹 Manage Exercises
  // ===========================
addExercise(ex: Exercise) {
  if (!this.workout) return;

  // ✅ prevent duplicate exercises in the current workout
  const alreadyExists = this.workoutExercises.some(
    e => e.exercise_id === ex.id
  );
  if (alreadyExists) {
    this.snackBar.open(`${ex.name} is already in your workout!`, 'OK', { duration: 2000 });
    // console.warn(`Exercise "${ex.name}" is already added to this workout.`);
    return; 
  }

  this.gymService.addExerciseToWorkout(this.workout.workout_id, ex.id).subscribe({
    next: (res) => {
      this.workoutExercises.push({
        workout_exercise_id: res.workout_exercise_id,
        exercise_id: ex.id,
        name: ex.name,
        sets: [],
        newSet: { reps: undefined, weight: undefined }
      });
      this.exerciseSearchControl.setValue('');
      this.showExerciseSearch = false;
    },
    error: (err) => console.error('Error adding exercise:', err)
  });
}

  removeExercise(ex: WorkoutExercise) {
    if (!this.workout) return;
    this.gymService.removeExerciseFromWorkout(this.workout.workout_id, ex.workout_exercise_id)
      .subscribe({
        next: () => {
          this.workoutExercises = this.workoutExercises.filter(e => e.workout_exercise_id !== ex.workout_exercise_id);
        },
        error: (err) => console.error('Error removing exercise:', err)
      });
  }

  // ===========================
  // 🔹 Manage Sets
  // ===========================
addSetInline(ex: WorkoutExercise) {
  if (
    !this.workout ||
    ex.newSet?.reps == null ||
    ex.newSet?.weight == null ||
    ex.newSet.reps <= 0
  ) return;

  const { reps, weight } = ex.newSet;

  this.gymService.addSet(this.workout.workout_id, ex.workout_exercise_id, reps, weight).subscribe({
    next: (res) => {
      if (res && res.set_id) {
        const newSet: SetEntry = { id: res.set_id, reps, weight };
        ex.sets.push(newSet);
      } else {
        console.warn('No set_id returned from backend:', res);
      }
      ex.newSet = {}; // reset input
    },
    error: (err) => console.error('Error adding set:', err)
  });
}
 
  removeSet(ex: WorkoutExercise, setId: number) {
    if (!this.workout) return;
    this.gymService.removeSet(this.workout.workout_id, ex.workout_exercise_id, setId).subscribe({
      next: () => {
        ex.sets = ex.sets.filter(s => s.id !== setId);
      },
      error: (err) => console.error('Error removing set:', err)
    });
  }
autoUpdateSet(ex: WorkoutExercise, set: EditableSet) {
  if (!this.workout || set.tempReps == null || set.tempWeight == null) return;

  // Validation: prevent invalid reps
  if (set.tempReps <= 0) return;

  // Only send update if something actually changed
  if (set.tempReps === set.reps && set.tempWeight === set.weight) return;

  const reps = set.tempReps;
  const weight = set.tempWeight;

  this.gymService.updateSet(
    this.workout.workout_id,
    ex.workout_exercise_id,
    set.id,
    reps,
    weight
  ).subscribe({
    next: () => {
      set.reps = reps;
      set.weight = weight;
      set.editing = false;
    },
    error: (err) => console.error('Auto-update failed:', err)
  });
}
}
  // ===========================
  // 🔹 Refresh Active Workout
  // ===========================
//   refreshWorkout() {
//     if (!this.workout) return;
//     this.gymService.getActiveWorkout().subscribe({
//       next: (res) => {
//         this.workoutExercises = (res.exercises || []).map((e: any) => ({
//           workout_exercise_id: e.id,
//           exercise_id: e.exercise.id,
//           name: e.exercise.name,
//           sets: e.sets || [],
//           newSet: { reps: undefined, weight: undefined }
//         }));
//       },
//       error: (err) => console.error('Error refreshing workout:', err)
//     });
//   }
// }
