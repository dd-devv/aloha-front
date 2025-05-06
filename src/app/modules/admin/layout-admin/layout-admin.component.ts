import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "../components/sidebar/sidebar.component";

@Component({
  selector: 'app-layout-admin',
  imports: [
    RouterOutlet,
    SidebarComponent
],
  templateUrl: './layout-admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutAdminComponent { }
