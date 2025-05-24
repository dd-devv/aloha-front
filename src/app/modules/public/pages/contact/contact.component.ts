import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../common/header/header.component';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'app-contact',
  imports: [
    HeaderComponent,
    FieldsetModule
  ],
  templateUrl: './contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContactComponent { }
