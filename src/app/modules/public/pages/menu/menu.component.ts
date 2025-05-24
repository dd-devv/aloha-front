import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../common/header/header.component';
import { ButtonModule } from 'primeng/button';
import { Carousel } from 'primeng/carousel';
import { CardModule } from 'primeng/card';
import { MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { CloudinaryImagePipe } from '../../../../pipes/cloudinary-image.pipe';
import { PlatosService } from '../../../../services/platos.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-menu',
  imports: [
    HeaderComponent,
    ButtonModule,
    Carousel,
    CardModule,
    MenuModule,
    FormsModule,
    CurrencyPipe,
    CloudinaryImagePipe,
  ],
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuComponent implements OnInit {

  private platoService = inject(PlatosService);
  private title = inject(Title);
  platos = this.platoService.platos;
  loading = this.platoService.loading;


  ngOnInit(): void {
    this.obtenerPlatos();
    this.title.setTitle('Aloha | Menú');
  }

  obtenerPlatos() {
    this.platoService.obtenerPlatos().subscribe({
      error: (err) => {
        console.log(err);
      }
    });
  }

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];
}
