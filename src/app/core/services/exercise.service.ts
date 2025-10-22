import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private base = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  listExercises(q: string = ''): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.base}/exercises?q=${q}`);
  }

  getExerciseHistory(exerciseId: number): Observable<ExerciseHistory> {
    return this.http.get<ExerciseHistory>(`${this.base}/history/exercise/${exerciseId}`);
  }

  getExerciseSummary(exerciseId: number): Observable<ExerciseSummary> {
    return this.http.get<ExerciseSummary>(`${this.base}/history/exercise/${exerciseId}/summary`);
  }
}
