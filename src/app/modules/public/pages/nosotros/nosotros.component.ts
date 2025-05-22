import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../common/header/header.component';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'app-nosotros',
  imports: [
    HeaderComponent,
    FieldsetModule
  ],
  templateUrl: './nosotros.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NosotrosComponent { }
