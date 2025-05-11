import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-barman',
  imports: [
    RouterOutlet
  ],
  templateUrl: './layout-barman.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LayoutBarmanComponent { }
