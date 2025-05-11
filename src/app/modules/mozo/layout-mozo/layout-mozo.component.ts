import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TiendaService } from '../../../services/tienda.service';

@Component({
  selector: 'app-layout-mozo',
  imports: [
    RouterOutlet
  ],
  templateUrl: './layout-mozo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LayoutMozoComponent implements OnInit {

  private tiendaService = inject(TiendaService);

  ngOnInit(): void {
    this.tiendaService.obtenerTienda().subscribe();
  }

}
