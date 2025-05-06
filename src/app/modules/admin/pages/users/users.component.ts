import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-users',
  imports: [TableModule, CommonModule, FieldsetModule, Button],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UsersComponent {

  users = [
    {
      nombres: 'pepe',
      apellidos: 'Perez',
      username: 'pepe_perez',
      role: 'MOZO'
    },
    {
      nombres: 'Flavio',
      apellidos: 'Perez',
      username: 'falvio_admin',
      role: 'ADMIN'
    }
  ];
 }
