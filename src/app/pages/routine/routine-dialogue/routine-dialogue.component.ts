import { Component, Inject } from '@angular/core';
import { Exercise } from '../../../core/services/gym_crud.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface RoutineDialogData {
  isEditing: boolean;
  name: string;
  selectedExercises: Exercise[];
  allExercises: Exercise[];
}

@Component({
  selector: 'app-routine-dialogue',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, FormsModule, CommonModule],
  templateUrl: './routine-dialogue.component.html',
  styleUrl: './routine-dialogue.component.css'
})



export class RoutineDialogueComponent {
  name: string;
  selectedExercises: Exercise[] = [];

  constructor(private dialog: MatDialog,
    public dialogRef: MatDialogRef<RoutineDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RoutineDialogData
  ) {
    this.name = data.name;
    this.selectedExercises = [...data.selectedExercises];
  }

  toggleExercise(exercise: Exercise) {
    const idx = this.selectedExercises.findIndex(e => e.id === exercise.id);
    if (idx > -1) this.selectedExercises.splice(idx, 1);
    else this.selectedExercises.push(exercise);
  }

  isSelected(exercise: Exercise): boolean {
    return this.selectedExercises.some(e => e.id === exercise.id);
  }

  save() {
    this.dialogRef.close({
      name: this.name,
      selectedExercises: this.selectedExercises
    });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
