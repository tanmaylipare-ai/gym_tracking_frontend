import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --------- Interfaces ---------
export interface Exercise {
  id: number;
  name: string;
  description?: string;
}

export interface ExerciseHistory {
  exercise_id: number;
  exercise_name: string;
  history: Record<string, { reps: number; weight: number }[]>;
}

export interface ExerciseSummary {
  exercise_id: number;
  max_weight: number;
  reps_at_max_weight: number;
  avg_reps: number;
  total_sets: number;
  total_volume: number;
  last_performed: string | null;
}

export interface Routine {
  id: number;
  name: string;
  exercise_count?: number;
}

export interface Workout {
  workout_id: number;
  status: string;
  exercises?: any[];
}

export interface SetEntry {
  id: number;
  reps: number;
  weight: number;
}

// -----------------------------------------------------

@Injectable({
  providedIn: 'root'
})
export class GymService {
  private base = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  // =============== EXERCISES ===============
  listExercises(q: string = ''): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.base}/exercises?q=${q}`);
  }

  createExercise(name: string, description?: string): Observable<any> {
    return this.http.post(`${this.base}/exercises?name=${name}&description=${description || ''}`, {});
  }

  getExerciseHistory(exerciseId: number, months: number = 6): Observable<ExerciseHistory> {
    return this.http.get<ExerciseHistory>(`${this.base}/history/exercise/${exerciseId}?months=${months}`);
  }

  getExerciseSummary(exerciseId: number, months: number = 6): Observable<ExerciseSummary> {
    return this.http.get<ExerciseSummary>(`${this.base}/history/exercise/${exerciseId}/summary?months=${months}`);
  }

  // =============== ROUTINES ===============
  listRoutines(): Observable<Routine[]> {
    return this.http.get<Routine[]>(`${this.base}/routines`);
  }

  createRoutine(name: string): Observable<any> {
    return this.http.post(`${this.base}/routines?name=${name}`, {});
  }

  updateRoutineName(routineId: number, name: string): Observable<any> {
    return this.http.put(`${this.base}/routines/${routineId}?name=${name}`, {});
  }

  deleteRoutine(routineId: number): Observable<any> {
    return this.http.delete(`${this.base}/routines/${routineId}`);
  }

  addExerciseToRoutine(routineId: number, exerciseId: number, position?: number, notes?: string): Observable<any> {
    let params = `?exercise_id=${exerciseId}`;
    if (position !== undefined) params += `&position=${position}`;
    if (notes) params += `&notes=${notes}`;
    return this.http.post(`${this.base}/routines/${routineId}/exercise${params}`, {});
  }

  removeExerciseFromRoutine(routineId: number, routineExerciseId: number): Observable<any> {
    return this.http.delete(`${this.base}/routines/${routineId}/exercise/${routineExerciseId}`);
  }

  startWorkoutFromRoutine(routineId: number): Observable<any> {
    return this.http.post(`${this.base}/routines/${routineId}/start`, {});
  }

  // =============== WORKOUTS ===============
  startWorkout(): Observable<any> {
    return this.http.post(`${this.base}/workouts`, {});
  }

  getActiveWorkout(): Observable<Workout> {
    return this.http.get<Workout>(`${this.base}/workouts/active`);
  }

  completeWorkout(workoutId: number): Observable<any> {
    return this.http.post(`${this.base}/workouts/${workoutId}/complete`, {});
  }

  discardWorkout(workoutId: number): Observable<any> {
    return this.http.delete(`${this.base}/workouts/${workoutId}`);
  }

  // =============== WORKOUT EXERCISES ===============
  addExerciseToWorkout(workoutId: number, exerciseId: number, position?: number, notes?: string): Observable<any> {
    let params = `?exercise_id=${exerciseId}`;
    if (position !== undefined) params += `&position=${position}`;
    if (notes) params += `&notes=${notes}`;
    return this.http.post(`${this.base}/workouts/${workoutId}/exercise${params}`, {});
  }

  removeExerciseFromWorkout(workoutId: number, workoutExerciseId: number): Observable<any> {
    return this.http.delete(`${this.base}/workouts/${workoutId}/exercise/${workoutExerciseId}`);
  }

  // =============== SETS ===============
  addSet(workoutId: number, weId: number, reps: number, weight: number): Observable<any> {
    return this.http.post(
      `${this.base}/workouts/${workoutId}/exercise/${weId}/sets?reps=${reps}&weight=${weight}`, {}
    );
  }

  removeSet(workoutId: number, weId: number, setId: number): Observable<any> {
    return this.http.delete(`${this.base}/workouts/${workoutId}/exercise/${weId}/sets/${setId}`);
  }

  updateSet(workoutId: number, weId: number, setId: number, reps: number, weight: number): Observable<any> {
  // Matching your query-param style (no backend changes needed)
  return this.http.put(
    `${this.base}/workouts/${workoutId}/exercise/${weId}/sets/${setId}?reps=${reps}&weight=${weight}`,
    {}
  );
  }

  removeAllSets(workoutId: number, weId: number): Observable<any> {
    return this.http.delete(`${this.base}/workouts/${workoutId}/exercise/${weId}/sets`);
  }
}
