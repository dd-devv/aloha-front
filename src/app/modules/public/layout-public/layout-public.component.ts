import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../common/footer/footer.component";

@Component({
  selector: 'app-layout-public',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './layout-public.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutPublicComponent { }
