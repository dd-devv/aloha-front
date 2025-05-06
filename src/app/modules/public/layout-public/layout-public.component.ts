import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../common/footer/footer.component";
import { ChangeThemeComponent } from "../common/change-theme/change-theme.component";

@Component({
  selector: 'app-layout-public',
  imports: [RouterOutlet, FooterComponent, ChangeThemeComponent],
  templateUrl: './layout-public.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutPublicComponent { }
