import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { ButtonDialComponent } from "../components/button-dial/button-dial.component";

@Component({
  selector: 'app-layout-admin',
  imports: [
    RouterOutlet,
    SidebarComponent,
    ButtonDialComponent
],
  templateUrl: './layout-admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutAdminComponent { }
