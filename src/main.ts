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
import { MainLayoutComponent } from './app/main-layout/main-layout.component';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/services/auth.intercepter';
import { AboutmeComponent } from './app/pages/aboutme/aboutme.component';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter([ 
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'me', component: AboutmeComponent },

      // ✅ Protected routes under MainLayout
      {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
          { path: 'home', component: HomeComponent },
          { path: 'profile', component: ProfileComponent },
          { path: 'routine', component: RoutineComponent },
          { path: 'exercise', component: ExerciseComponent },
          { path: 'workout', component: WorkoutComponent },
          { path: '', redirectTo: 'home', pathMatch: 'full' } // default after login
        ]
      },
            // Wildcard (unknown paths)
      { path: '**', redirectTo: 'login' }
    ]),
    importProvidersFrom(BrowserAnimationsModule, HttpClientModule)
  ]
});