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
    '../../../../../assets/images/alitas.avif',
    '../../../../../assets/images/cocteleria-tiki.webp',
    '../../../../../assets/images/alitas3.avif'
  ];

  currentImageIndex = 0;
  private intervalId: any;
  private isBrowser: boolean;
  private platoService = inject(PlatosService);
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

  images = [
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526907/AKU-AKU_wnovej.png',
      name: 'Aku Aku'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526892/ALGARROBINA_guwkw2.png',
      name: 'Algarrobina'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526907/ALITAS-EN-SALSA-BUFALO_qqjebb.png',
      name: 'Alitas en salsa bufalo'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526845/ALITAS-EN-SALSA-MARACUYA_jz2mij.png',
      name: 'Alitas en salsa maracuyá'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526855/ALOHA-TROPICAL_s4zrmc.png',
      name: 'Aloha Tropical'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526891/ALITAS-ACEVICHADAS-C_q90ga8.png',
      name: 'Alitas en salsa acebichada'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526836/ALITAS-BBQ-C_kzkmio.png',
      name: 'Alitas BBQ'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526875/BON-AMI_d4wzoy.png',
      name: 'Bon ami'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526864/CALENTADO-DE-MARACUYA_n6a0l4.png',
      name: 'Calentado de maracuyá'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526882/CALENTADO-INVIERNO-ROJO_ulbdwv.png',
      name: 'Calentado invierno rojo'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526875/CALENTADO-PITEADO-DE-NARANJA_uwqb4b.png',
      name: 'Calentado piteado de naranja'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526836/CHILCANO-DE-MARACUYA_dfu7mt.png',
      name: 'Chilcano de maracuyá'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526853/JUNGLE-BIRD_rs6ooj.png',
      name: 'Jungle Bird'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526892/SUSPIRO-HAWAINO_apn5kc.png',
      name: 'Suspiro Hawaiano'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526895/MOJITO-CLASICO-C_w1cxjo.png',
      name: 'Mojito clásico'
    },
    {
      src: 'https://res.cloudinary.com/dtttoiss7/image/upload/f_avif,q_30/v1747526884/PI%C3%91A-COLADA_xp0w25.png',
      name: 'Piña colada'
    },
  ];

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
