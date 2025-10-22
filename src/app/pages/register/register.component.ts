import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatInputModule,  MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'  
})
// export class RegisterComponent {
//   username='';
//   email = '';
//   password = '';

//   constructor(private auth: AuthService, private router: Router) {}

//   onRegister() {
//     this.auth.register(this.username,this.email, this.password).subscribe({
//       next: () => this.router.navigate(['/login']),
//       error: err => console.error(err)
//     });
//   }
// }
export class RegisterComponent {
  username = '';
  email = '';
  password:string = '';
  errorMessage: string | null = null;
  currentYear='2025'
  password_hide = true;

  passwordHasMinLength = false;
  passwordHasUppercase = false;
  passwordHasLowercase = false;
  passwordHasNumber = false;
  passwordHasSpecialChar = false;

  constructor(private auth: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  onRegister(form: NgForm) {
    if (form.invalid) {
      this.errorMessage = null; // we rely on field-level errors
      return;
    }

    this.auth.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.snackBar.open('Registered successfully!', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: err => {
        this.errorMessage = err.error?.detail || 'Registration failed';
      }
    });
  }

  dismissError() {
    this.errorMessage = null;
  }
  checkPasswordStrength() {
  const pw = this.password || '';
  this.passwordHasMinLength = pw.length >= 8;
  this.passwordHasUppercase = /[A-Z]/.test(pw);
  this.passwordHasLowercase = /[a-z]/.test(pw);
  this.passwordHasNumber = /\d/.test(pw);
  this.passwordHasSpecialChar = /[\W_]/.test(pw);
}

}