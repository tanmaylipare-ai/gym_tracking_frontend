import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8000/auth'; // FastAPI backend endpoint local

  constructor(private http: HttpClient) {}

  // login(email: string, password: string) {
  //   return this.http.post<{ access_token: string }>(`${this.baseUrl}/login`, { username: email, password })
  //     .pipe(tap(res => localStorage.setItem('token', res.access_token)));
  // }
  login(email: string, password: string) {
    const body = new HttpParams()
      .set('username', email)
      .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<{ access_token: string }>(
      `${this.baseUrl}/login`,
      body.toString(),
      { headers }
    ).pipe(
      tap(res => localStorage.setItem('token', res.access_token))
    );
  }

  register(name: string, email: string, password: string) {
    return this.http.post(`${this.baseUrl}/register`, { name, email, password });
  }

  getCurrentUser() {
  const token = localStorage.getItem('token');

  if (!token) {
    return null; // or throw an error or return an Observable that emits null
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get(`${this.baseUrl}/me`, { headers });
}

  logout() {
    localStorage.removeItem('token');
  }

    checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(false);
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.get(`${this.baseUrl}/me`, { headers }).pipe(
      map(() => true),  // If successful, return true
      catchError(() => of(false))  // On error (invalid token), return false
    );
  }

}
