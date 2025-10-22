
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatDivider } from "@angular/material/divider";
import { MatDrawerContent, MatDrawer, MatDrawerContainer } from "@angular/material/sidenav";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderComponent, MatCardModule, MatButtonModule, MatDrawerContent, MatDrawer, MatDrawerContainer],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {

}
