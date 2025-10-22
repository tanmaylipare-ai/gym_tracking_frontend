import { MatSelectModule } from '@angular/material/select';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { catchError, map, of, startWith } from 'rxjs';
import { Observable } from 'rxjs';
import { Exercise, ExerciseHistory, ExerciseService, ExerciseSummary } from '../../core/services/exercise.service';

@Component({
  selector: 'app-exercise',
  standalone: true,
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatSelectModule
  ]
})
export class ExerciseComponent implements OnInit {
  exercises: Exercise[] = [];
  selectedExercise: Exercise | null = null;
  exerciseSummary: ExerciseSummary | null = null;
  exerciseHistory: ExerciseHistory | null = null;
  searchQuery: string = '';

  // Autocomplete
  exerciseSearchControl = new FormControl('');
  filteredExercises$: Observable<Exercise[]> = of([]);

  constructor(private exerciseService: ExerciseService) {}

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.exerciseService.listExercises(this.searchQuery).subscribe({
      next: (data) => {
        this.exercises = data;
        this.filteredExercises$ = this.exerciseSearchControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value || ''))
        );
      },
      error: (err) => console.error(err)
    });
  }

  private _filter(value: string): Exercise[] {
    const filterValue = value.toLowerCase();
    return this.exercises.filter(ex => ex.name.toLowerCase().includes(filterValue));
  }

  search(): void {
    this.loadExercises();
  }

  onExerciseSelect(exerciseName: string): void {
    const ex = this.exercises.find(e => e.name === exerciseName);
    if (ex) this.selectExercise(ex);
  }

  selectExercise(ex: Exercise): void {
    this.selectedExercise = ex;
    this.exerciseSummary = null;
    this.exerciseHistory = null;

    this.exerciseService.getExerciseSummary(ex.id)
      .pipe(catchError(() => of(null)))
      .subscribe(summary => (this.exerciseSummary = summary));
  }
}
