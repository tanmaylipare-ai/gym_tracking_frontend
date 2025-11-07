import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';


declare const AOS: any; // for Animate On Scroll library

@Component({
  selector: 'app-aboutme',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aboutme.component.html',
  styleUrl: './aboutme.component.css'
})
export class AboutmeComponent  implements OnInit{
    ngOnInit(): void {
      // Initialize AOS animations if available
    if (typeof AOS !== 'undefined') {
    AOS.init({
    once: true,
    duration: 1000,
    easing: 'ease-in-out'
    });}
}
theme: 'light' | 'dark' = 'dark';
themeIcon = '🌙';
formMsg = '';
currentYear = new Date().getFullYear();


toggleTheme() {
this.theme = this.theme === 'light' ? 'dark' : 'light';
this.themeIcon = this.theme === 'light' ? '☀️' : '🌙';
}


onSubmit(event: Event) {
event.preventDefault();
this.formMsg = 'Opening your email client...';
const form = event.target as HTMLFormElement;
const name = (form.querySelector('#name') as HTMLInputElement).value;
const email = (form.querySelector('#email') as HTMLInputElement).value;
const message = (form.querySelector('#message') as HTMLTextAreaElement).value;
const mailto = `mailto:liparetanmayofficial@gmail.com?subject=${encodeURIComponent('Portfolio contact: ' + name)}&body=${encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')')}`;
window.location.href = mailto;
}

projects = [
    {
      name: 'Gym Tracker',
      description: 'A workout tracker app built with Angular, FastAPI, and PostgreSQL.',
      link: '#'
    },
    {
      name: 'Restaurant Management System',
      description: 'A FastAPI + Angular web app to manage restaurant tables and orders.',
      link: '#'
    },
    {
      name: 'Lift Heavy',
      description: 'A strength tracking application inspired by Hevy.',
      link: '#'
    }
  ];

}
