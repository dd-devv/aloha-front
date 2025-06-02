import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
import { Tag } from 'primeng/tag';
import { CategoriaService } from '../../../../services/categoria.service';
import { CategoriaFilterService } from '../../../../services/categoria-filter.service';

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
    Tag
  ],
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuComponent implements OnInit {

  private platoService = inject(PlatosService);
  private categoriaService = inject(CategoriaService);
  private categoriaFilterService = inject(CategoriaFilterService);
  private title = inject(Title);
  categorias = this.categoriaService.categoriasPublic;
  platos = signal<any[]>([]);
  platosAll = signal<any[]>([]);
  loading = this.platoService.loading;

  categorias_select = signal<string[]>([]);


  ngOnInit(): void {
    this.obtenerCategorias();
    this.obtenerPlatos();
    this.title.setTitle('Aloha | Menú');
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
