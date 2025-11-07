import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { Exercise, GymService, Routine } from '../../core/services/gym_crud.service';
import { Router } from '@angular/router';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { RoutineDialogueComponent } from './routine-dialogue/routine-dialogue.component';

@Component({
  selector: 'app-routine',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatFormFieldModule, FormsModule,CommonModule, MatDialogModule],
  templateUrl: './routine.component.html',
  styleUrl: './routine.component.css'
})



export class RoutineComponent implements OnInit {

  routines: Routine[] = [];
  exercises: Exercise[] = [];

  creatingOrEditing = false;
  isEditing = false;
  newRoutineName = '';
  selectedExercises: Exercise[] = [];
  editingRoutineId: number | null = null;

  constructor(private gym: GymService, private router: Router,private dialog: MatDialog) {}
ngOnInit() {
    this.loadRoutines();
    this.loadExercises();
  }

  loadRoutines() {
    this.gym.listRoutines().subscribe(data => this.routines = data);
  }

  loadExercises() {
    this.gym.listExercises().subscribe(data => this.exercises = data);
  }

  startWorkout(routineId: number) {
    this.gym.startWorkoutFromRoutine(routineId).subscribe(() => {
      this.loadRoutines();
    });
  }

  deleteRoutine(id: number) {
    if (confirm('Are you sure you want to delete this routine?')) {
      this.gym.deleteRoutine(id).subscribe(() => this.loadRoutines());
    }
  }

  // -------------------------------
  // CREATE / EDIT ROUTINE DIALOG
  // -------------------------------
  openRoutineDialog(isEditing = false, routine?: Routine) {
    const selectedExercises: Exercise[] = [];
    if (isEditing && routine) {
      // optionally fetch routine exercises if available
    }

    const dialogRef = this.dialog.open(RoutineDialogueComponent, {
      width: '400px',
      data: {
        isEditing,
        name: isEditing ? routine?.name || '' : '',
        selectedExercises,
        allExercises: this.exercises
      }
    });

    dialogRef.afterClosed().subscribe((result: { name: string; selectedExercises: Exercise[]; } | null) => {
      if (!result) return;
      if (isEditing && routine) {
        this.updateRoutine(routine.id, result.name, result.selectedExercises);
      } else {
        this.createRoutine(result.name, result.selectedExercises);
      }
    });
  }

  startCreating() {
    this.openRoutineDialog(false);
  }

  editRoutine(routine: Routine) {
    this.openRoutineDialog(true, routine);
  }

createRoutine(name: string, selectedExercises: Exercise[]) {
  this.gym.createRoutine(name).subscribe({
    next: (res: any) => {
      const newRoutineId = res.routine_id; // ✅ get the returned ID
      if (!newRoutineId) {
        console.error('Routine created but no ID returned');
        return;
      }

      // Now add exercises one by one
      if (selectedExercises && selectedExercises.length > 0) {
        selectedExercises.forEach((ex, index) => {
          this.gym.addExerciseToRoutine(newRoutineId, ex.id, index + 1).subscribe();
        });
      }

      // Refresh list after adding
      setTimeout(() => this.loadRoutines(), 500);
    },
    error: err => {
      console.error('Error creating routine:', err);
    }
  });
}

  updateRoutine(routineId: number, name: string, exercises: Exercise[]) {
    this.gym.updateRoutineName(routineId, name).subscribe(() => {
      // Optional: clear + re-add exercises if backend supports it
      exercises.forEach((ex, i) => {
        this.gym.addExerciseToRoutine(routineId, ex.id, i + 1).subscribe();
      });
      this.loadRoutines();
    });
  }
}