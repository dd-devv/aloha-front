import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from 'primeng/button';
import { Observable } from 'rxjs';
import { ThemeService } from '../../../../services/theme.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-change-theme',
  imports: [
    Button,
    AsyncPipe
  ],
  templateUrl: './change-theme.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeThemeComponent {
  isDarkTheme$: Observable<boolean>;

  constructor(private themeService: ThemeService) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }


  toggleTheme() {
    this.themeService.toggleTheme();
  }

}
