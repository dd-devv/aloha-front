import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Carousel } from 'primeng/carousel';
import { MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { PlatosService } from '../../../../services/platos.service';
import { CloudinaryImagePipe } from '../../../../pipes/cloudinary-image.pipe';
import { HeaderComponent } from '../../common/header/header.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  imports: [
    ButtonModule,
    Carousel,
    CardModule,
    MenuModule,
    FormsModule,
    CurrencyPipe,
    CloudinaryImagePipe,
    HeaderComponent
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent implements OnInit, OnDestroy {

  bgImages = [
    'https://res.cloudinary.com/dtttoiss7/image/upload/v1748120789/alitas_rxmqln.png',
    'https://res.cloudinary.com/dtttoiss7/image/upload/v1748120781/mojito_mrmbhu.png',
    'https://res.cloudinary.com/dtttoiss7/image/upload/v1748120770/tiki_ras1vi.png',
    'https://res.cloudinary.com/dtttoiss7/image/upload/v1748120786/piscosour_luogcb.png',
    'https://res.cloudinary.com/dtttoiss7/image/upload/v1748120757/tiki2_d4vdc3.png'
  ];

  currentImageIndex = 0;
  private intervalId: any;
  private isBrowser: boolean;
  private platoService = inject(PlatosService);
  private title = inject(Title);
  platos = this.platoService.platos;
  loading = this.platoService.loading;

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    // Solo ejecutar en el navegador
    if (this.isBrowser) {
      this.title.setTitle('Aloha | Inicio');
      this.startImageRotation();
      this.obtenerPlatos();
    }
  }

  obtenerPlatos() {
    this.platoService.obtenerPlatos().subscribe({
      error: (err) => {
        console.log(err);
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startImageRotation() {
    this.intervalId = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.bgImages.length;
      this.cdr.detectChanges();
    }, 4000);
  }

  get currentBackgroundImage() {
    return this.bgImages[this.currentImageIndex];
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
