import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { LoginComponent } from './app/pages/login/login.component';
import { RegisterComponent } from './app/pages/register/register.component';
import { HomeComponent } from './app/pages/home/home.component';
import { ProfileComponent } from './app/pages/profile/profile.component';
import { RoutineComponent } from './app/pages/routine/routine.component';
import { ExerciseComponent } from './app/pages/exercise/exercise.component';
import { WorkoutComponent } from './app/pages/workout/workout.component';
import { authGuard } from './app/core/guards/auth.guard';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'home', component: HomeComponent, canActivate: [authGuard] },
      { path: 'profile', component: ProfileComponent,canActivate: [authGuard]  },
      { path: 'routine', component: RoutineComponent,canActivate: [authGuard]  },
      { path: 'exercise', component: ExerciseComponent,canActivate: [authGuard]  },
      { path: 'workout', component: WorkoutComponent,canActivate: [authGuard]  },
    ]),
    importProvidersFrom(BrowserAnimationsModule, HttpClientModule)
  ]
});