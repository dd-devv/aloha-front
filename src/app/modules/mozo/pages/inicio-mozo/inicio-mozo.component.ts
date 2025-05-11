import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio-mozo',
  imports: [
    RouterLink
  ],
  templateUrl: './inicio-mozo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InicioMozoComponent { }
