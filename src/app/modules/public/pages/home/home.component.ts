import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID, inject, signal } from '@angular/core';
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
import { Tag } from 'primeng/tag';
import { CategoriaService } from '../../../../services/categoria.service';
import { CategoriaFilterService } from '../../../../services/categoria-filter.service';

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
    HeaderComponent,
    Tag
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
  private categoriaService = inject(CategoriaService);
  private categoriaFilterService = inject(CategoriaFilterService);
  private title = inject(Title);

  platos = signal<any[]>([]);
  platosAll = signal<any[]>([]);
  categorias = this.categoriaService.categoriasPublic;
  loading = this.platoService.loading;
  categorias_select = signal<string[]>([]);

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
      this.obtenerCategorias();
      this.obtenerPlatos();
    }
  }

  obtenerCategorias() {
    this.categoriaService.obtenerCategoriasPublic().subscribe({
      error: (err) => {
        console.log(err);
      }
    });
  }

  obtenerPlatos() {
    this.platoService.obtenerPlatosPublic().subscribe({
      next: (res) => {
        const todosLosPlatos = [...this.platoService.platosPublic()];
        this.platosAll.set(todosLosPlatos);
        this.platos.set(todosLosPlatos);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  esCategoriaSeleccionada(id_categoria: string): boolean {
    return this.categorias_select().includes(id_categoria);
  }

  seleccionarCategoria(id_categoria: string): void {
    const categoriasActuales = [...this.categorias_select()];
    const todosLosPlatos = [...this.platosAll()];

    const indice = categoriasActuales.indexOf(id_categoria);

    if (indice >= 0) {
      categoriasActuales.splice(indice, 1);
    } else {
      categoriasActuales.push(id_categoria);
    }

    this.categorias_select.set(categoriasActuales);
    this.categoriaFilterService.setCategorias(categoriasActuales);

    if (categoriasActuales.length === 0) {
      this.platos.set(todosLosPlatos);
    } else {
      // Filtrar por las categorías seleccionadas
      const platosFiltrados = todosLosPlatos.filter(plato => {
        return plato.categoria && categoriasActuales.includes(plato.categoria);
      });

      this.platos.set(platosFiltrados);
    }
  }

  seleccionarTodas(): void {
    const todosLosPlatos = [...this.platosAll()];
    this.categorias_select.set([]);
    this.categoriaFilterService.clearCategorias();

    if (todosLosPlatos.length > 0) {
      this.platos.set(todosLosPlatos);
    } else {
      this.obtenerPlatos();
    }
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
