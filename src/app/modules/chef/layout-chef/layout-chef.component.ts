import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-chef',
  imports: [
    RouterOutlet
  ],
  templateUrl: './layout-chef.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LayoutChefComponent { }
