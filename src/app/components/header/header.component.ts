import { Component, HostListener, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  // @Input() username: string = 'User';
  
  username: string | null = null;  //--------------placeholder change later with user from service.
  isMobile = false;
  authService: any;

  ngOnInit() {
    this.checkScreenWidth();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenWidth();
  }

  private checkScreenWidth() {
    this.isMobile = window.innerWidth < 768;  // adjust breakpoint as needed
  }
  loadCurrentUser() {
    this.authService.getCurrentUser().subscribe(
      (user: any) => {
        this.username = user.email || user.username || null;
      },
      (error: HttpErrorResponse) => {
        this.username = null;
        // optionally handle/log the error
        console.error('Failed to load current user:', error);
      }
    );
  }
  
  logout() {
    localStorage.removeItem('token');
    location.href = '/login';
  }
}