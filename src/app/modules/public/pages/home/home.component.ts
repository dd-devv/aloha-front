import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { MenuModule } from 'primeng/menu';
import { RouterLink } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [
    ButtonModule,
    CarouselModule,
    CardModule,
    MenuModule,
    RouterLink,
    GalleriaModule,
    FormsModule
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {
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

  responsiveOptions: any[] = [
    {
      breakpoint: '991px',
      numVisible: 4
    },
    {
      breakpoint: '767px',
      numVisible: 3
    },
    {
      breakpoint: '575px',
      numVisible: 1
    }
  ];
}
